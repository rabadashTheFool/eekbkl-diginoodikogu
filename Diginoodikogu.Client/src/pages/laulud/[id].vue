<script setup lang="ts">
  import {
    Laul,
    QueryLaulud,
    QueryResponse,
    QueryVariatsioonid,
    Variatsioon,
  } from '@/dtos'
  import type { ETCDirections } from '@/ETC'
  import { ExtendedTransposeCalculator } from '@/ExtendedTransposeCalculator'
  import { MAJOR_KEYS, MINOR_KEYS, TRANSPOSE_KEY_VALUE } from '@/keys'
  import { ApiResult } from '@servicestack/client'
  import { useAuth, useClient } from '@servicestack/vue'
  import { useHead } from '@unhead/vue'
  import { ChordProParser, HtmlDivFormatter, Key } from 'chordsheetjs'
  import { jsPDF } from 'jspdf'
  import {
    OpenSheetMusicDisplay,
    SvgVexFlowBackend,
    type IOSMDOptions,
  } from 'opensheetmusicdisplay'
  import 'svg2pdf.js'
  import { computed, onBeforeUnmount, onMounted, onUpdated, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  const route = useRoute()
  const router = useRouter()
  const id = computed(() => (route.params as any)?.id)

  const client = useClient()
  const api = ref(new ApiResult())

  const { hasRole, isAdmin, user } = useAuth()
  const canEdit = computed(
    () => isAdmin() || (hasRole('Sisestaja') && isCreatedByCurrentUser())
  )
  const isEditMode = ref(false)
  const showAddVar = ref(false)
  const showEditVar = ref(false)
  const showModal = ref(false)

  /**
   * Returns true if the current user created the song or the selected variation,
   * false otherwise.
   */
  const isCreatedByCurrentUser = () => {
    if (selectedVar.value) {
      return user.value?.userId === selectedVar.value.createdBy
    } else {
      return user.value?.userId === laul.value?.createdBy
    }
  }

  const startLaulEdit = () => {
    isEditMode.value = true
    showModal.value = true
  }

  const startAddVariatsioon = () => {
    showAddVar.value = true
    showModal.value = true
  }

  const startEditVariatsioon = () => {
    showEditVar.value = true
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    isEditMode.value = false
    showAddVar.value = false
    showEditVar.value = false
  }

  const formatter = new HtmlDivFormatter()

  const chordProParser = new ChordProParser()
  const showMusicXml = ref(true)

  const chordProSong = ref()
  const musicXml = ref()
  const activeOrigKey = ref()

  const selectedVarChanged = () => {
    router.replace({
      path: route.path,
      query: { varId: selectedVar.value?.id },
    })
    if (selectedVar.value) {
      musicXml.value = selectedVar.value.musicXml
      chordProSong.value = selectedVar.value.chordPro
        ? chordProParser.parse(selectedVar.value.chordPro)
        : null
      activeOrigKey.value = selectedVar.value.helistik
    } else {
      route.query.varId = null
      musicXml.value = laul.value!.musicXml
      chordProSong.value = laul.value!.chordPro
        ? chordProParser.parse(laul.value!.chordPro)
        : null
      activeOrigKey.value = laul.value!.helistik
    }
    restoreOrigKey()
  }

  const currentKey = ref<string>()

  const laul = ref<Laul>()
  const variatsioonid = ref<(Variatsioon | null)[]>()

  const selectedVar = ref<Variatsioon | undefined>(undefined)

  const chordProHtml = computed(() => {
    if (!chordProSong.value) {
      return ''
    }
    return formatter.format(chordProSong.value)
  })

  const osmdRef = ref()
  let osmd: OpenSheetMusicDisplay | null = null

  let darkModeObserver: MutationObserver | null = null
  let darkMode = false

  const toggleOsmdDarkMode = () => {
    osmdOptions.darkMode = darkMode
    osmd?.setOptions(osmdOptions)
    osmd?.updateGraphic()
    osmd?.render()
  }

  const mutationCallback = (mutationsList: MutationRecord[]): void => {
    for (const mutation of mutationsList) {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'class'
      ) {
        const currentDarkModeState = (
          mutation.target as Element
        ).classList.contains('dark')
        if (darkMode !== currentDarkModeState) {
          darkMode = currentDarkModeState
          toggleOsmdDarkMode()
        }
        break
      }
    }
  }

  onMounted(async () => {
    darkMode = document.documentElement.classList.contains('dark')
    darkModeObserver = new MutationObserver(mutationCallback)
    darkModeObserver.observe(document.documentElement, { attributes: true })
    await refresh()
  })

  onBeforeUnmount(() => {
    darkModeObserver?.disconnect()
  })

  const refresh = async () => {
    api.value = await client.api(new QueryLaulud({ id: id.value }))
    if (api.value.succeeded) {
      laul.value = (api.value.response as QueryResponse<Laul>).results[0]
      useHead({ title: laul.value.nimi })
      await queryVariatsioonid()
      selectedVar.value =
        variatsioonid.value?.find((v) => v!.id == route.query.varId) ||
        undefined
      selectedVarChanged()
      setCurrentKey()
    }
  }

  const setCurrentKey = () => {
    if (route.query.key) {
      currentKey.value = route.query.key
    } else {
      currentKey.value = activeOrigKey.value
    }
    setKey()
  }

  const queryVariatsioonid = async () => {
    const varApi = await client.api(
      new QueryVariatsioonid({ laulId: laul.value?.id })
    )
    if (varApi.succeeded && varApi.response?.results.length) {
      const response = varApi.response as unknown as QueryResponse<Variatsioon>
      variatsioonid.value = response.results
    }
  }

  const editDone = (cancelled: boolean) => {
    isEditMode.value = false
    showModal.value = false
    if (!cancelled) refresh()
  }

  const addVarDone = async (cancelled: boolean) => {
    showAddVar.value = false
    showModal.value = false
    if (!cancelled) await queryVariatsioonid()
  }

  const editVarDone = async (cancelled: boolean) => {
    showEditVar.value = false
    showModal.value = false
    if (!cancelled) await queryVariatsioonid()
  }

  onUpdated(async () => {
    if (musicXml.value) {
      await renderMusicXml()
    }
  })

  const restoreOrigKey = () => {
    currentKey.value = activeOrigKey.value
    setKey()
  }

  const selectableKeys = computed<string[]>(() => {
    const keyObj = Key.wrapOrFail(laul.value!.helistik)
    return keyObj.isMinor() ? MINOR_KEYS : MAJOR_KEYS
  })

  const setKey = async () => {
    const routeKey =
      currentKey.value !== activeOrigKey.value ? currentKey.value : undefined
    if (routeKey === route.query.key) return
    router.replace({
      path: route.path,
      query: { varId: selectedVar.value?.id, key: routeKey },
    })

    if (chordProSong.value) {
      chordProSong.value = chordProSong.value.changeKey(currentKey.value)
    }
  }

  const renderMusicXml = async () => {
    if (!musicXml.value || !currentKey.value) {
      return
    }
    if (!osmd) {
      osmdOptions.darkMode = darkMode
      osmd = new OpenSheetMusicDisplay(osmdRef.value, osmdOptions)
      osmd.EngravingRules.DefaultVexFlowNoteFont = 'Bravura'
    }
    osmd.clear()

    await osmd.load(musicXml.value)
    osmd.Zoom = 0.7
    let transposeCalc = new ExtendedTransposeCalculator(osmd)
    osmd.TransposeCalculator = transposeCalc
    const distance = Key.distance(activeOrigKey.value, currentKey.value!)
    const direction: ETCDirections = 12 - distance >= distance ? 'up' : 'down'
    transposeCalc.Options.TransposeDirection = direction
    transposeCalc.Options.transposeToKeyRelation(
      TRANSPOSE_KEY_VALUE[currentKey.value]
    )
    osmd?.updateGraphic()
    osmd.render()
  }

  const osmdOptions: IOSMDOptions = {
    backend: 'svg',
    drawTitle: true,
    darkMode: false,
    pageBackgroundColor: '#00000000',
  }

  const zoomIn = () => {
    if (osmd) {
      osmd.Zoom = osmd.Zoom * 1.2
      osmd.render()
    }
  }

  const zoomOut = () => {
    if (osmd) {
      osmd.Zoom = osmd.Zoom / 1.2
      osmd.render()
    }
  }

  let pdfIframe: HTMLIFrameElement | null = null

  /**
   * Creates a Pdf of the currently rendered MusicXML
   * @param pdfName if no name is given, the composer and title of the piece will be used
   */
  async function createPdf() {
    if (!osmd) return

    const backends = osmd.Drawer.Backends
    let svgElement = (backends[0] as SvgVexFlowBackend).getSvgElement()

    let pageWidth = 210
    let pageHeight = 297
    const engravingRulesPageFormat = osmd.EngravingRules.PageFormat
    if (engravingRulesPageFormat && !engravingRulesPageFormat.IsUndefined) {
      pageWidth = engravingRulesPageFormat.width
      pageHeight = engravingRulesPageFormat.height
    } else {
      pageHeight =
        (pageWidth * svgElement.clientHeight) / svgElement.clientWidth
    }

    const orientation = pageHeight > pageWidth ? 'p' : 'l'
    // create a new jsPDF instance
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: [pageWidth, pageHeight],
    })
    //const scale = pageWidth / svgElement.clientWidth;
    for (let idx = 0, len = backends.length; idx < len; ++idx) {
      if (idx > 0) {
        pdf.addPage()
      }
      svgElement = (backends[idx] as SvgVexFlowBackend).getSvgElement()

      if (!pdf.svg) {
        console.log('svg2pdf missing, necessary for jspdf.svg().')
        return
      }
      await pdf.svg(svgElement, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      })
    }

    if (pdfIframe) {
      document.body.removeChild(pdfIframe)
      pdfIframe = null
    }

    pdfIframe = document.createElement('iframe')
    pdfIframe.style.display = 'none'
    document.body.appendChild(pdfIframe)
    pdfIframe.src = pdf.output('bloburl').toString()
    pdfIframe.onload = function () {
      pdfIframe!.contentWindow!.print()
    }
  }
</script>

<template>
  <div class="mt-8 mb-20 mx-auto max-w-fit" style="max-width: 21cm">
    <div v-if="canEdit && showModal">
      <ModalDialog v-if="showModal" @done="closeModal">
        <SongEdit v-if="isEditMode" @done="editDone" :laul="laul!" />ˇ
        <VariatsioonCreate
          v-if="showAddVar"
          @done="addVarDone"
          :laul-id="laul!.id" />
        <VariatsioonEdit
          v-if="showEditVar"
          @done="editVarDone"
          :variatsioon="selectedVar!"
          :key="currentKey" />
      </ModalDialog>
    </div>
    <div>
      <div v-if="api.response">
        <h1 class="font-bold text-3xl mx-auto mb-4 w-fit">{{ laul?.nimi }}</h1>
        <div v-if="canEdit" class="flex gap-2 mb-2" style="max-width: 21cm">
          <SecondaryButton v-if="!selectedVar" @click="startLaulEdit"
            >Muuda laulu</SecondaryButton
          >
          <SecondaryButton v-if="selectedVar" @click="startEditVariatsioon"
            >Muuda variatsiooni</SecondaryButton
          >
          <SecondaryButton @click="startAddVariatsioon"
            >Lisa variatsioon</SecondaryButton
          >
        </div>
        <div class="flex gap-2 mb-2" style="max-width: 21cm">
          <label class="my-auto">Helistik</label>
          <SelectInput
            class="w-fit"
            v-model="currentKey"
            @change="setKey"
            required
            :values="selectableKeys" />
          <SecondaryButton class="mt-1" @click="restoreOrigKey"
            >Taasta alghelistik</SecondaryButton
          >
          <SecondaryButton v-if="showMusicXml" class="mt-1" @click="zoomIn">
            <Iconify icon="mdi:magnify-plus-outline" class="w-6 h-6" />
          </SecondaryButton>
          <SecondaryButton v-if="showMusicXml" class="mt-1" @click="zoomOut">
            <Iconify icon="mdi:magnify-minus-outline" class="w-6 h-6" />
          </SecondaryButton>
          <SecondaryButton
            v-if="!showMusicXml && musicXml"
            class="mt-1"
            @click="showMusicXml = true"
            >Noot
          </SecondaryButton>
          <SecondaryButton
            v-if="showMusicXml && chordProSong"
            class="mt-1"
            @click="showMusicXml = false"
            >Akordid
          </SecondaryButton>
          <SecondaryButton @click="createPdf" class="mt-1">
            <Iconify icon="mdi:printer" class="w-6 h-6" />
          </SecondaryButton>
        </div>
        <div v-if="variatsioonid && variatsioonid.length" class="mb-4">
          <select
            class="mt-1 w-fit block pl-3 pr-10 py-2 text-base focus:outline-none sm:text-sm rounded-md dark:text-white dark:bg-gray-900 dark:border-gray-600 border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
            @change="selectedVarChanged"
            v-model="selectedVar">
            <option :value="undefined">Esimene</option>
            <option v-for="v in variatsioonid" :key="v!.id" :value="v">
              {{ v!.nimetus }}
            </option>
          </select>
        </div>
        <div>
          <div v-show="!showMusicXml" v-html="chordProHtml"></div>
          <div v-show="showMusicXml" ref="osmdRef"></div>
        </div>
        <div v-if="api.error" class="text-red-500">{{ api.error.message }}</div>
      </div>
      <Loading v-else class="w-fit mx-auto">Laen...</Loading>
    </div>
  </div>
</template>
