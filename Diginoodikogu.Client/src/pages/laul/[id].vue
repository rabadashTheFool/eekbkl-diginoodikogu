<template>
  <div class="mt-8 mb-20 mx-auto max-w-fit" style="max-width:21cm">
    <div v-if="canEdit && showModal">
      <ModalDialog v-if="showModal" @done="closeModal">
        <SongEdit v-if="isEditMode" @done="editDone" :laul="laul!" />ˇ
        <VariatsioonCreate v-if="showAddVar" @done="addVarDone" :laul-id="laul!.id" />
        <VariatsioonEdit v-if="showEditVar" @done="editVarDone" :variatsioon="selectedVar!" :key="currentKey" />
      </ModalDialog>
    </div>
    <div>
      <div v-if="api.response">
        <div v-if="canEdit" class="flex gap-2 mb-2" style="max-width: 21cm;">
          <SecondaryButton v-if="!selectedVar" @click="startLaulEdit">Muuda laulu</SecondaryButton>
          <SecondaryButton v-if="selectedVar" @click="startEditVariatsioon">Muuda variatsiooni</SecondaryButton>
          <SecondaryButton @click="startAddVariatsioon">Lisa variatsioon</SecondaryButton>
        </div>
        <div class="flex gap-2 mb-2" style="max-width: 21cm;">
          <label class="my-auto">Helistik</label>
          <SelectInput class="w-fit" v-model="currentKey" @change="setKey" required :values="selectableKeys" />
          <SecondaryButton class="mt-1" @click="restoreOrigKey">Taasta alghelistik</SecondaryButton>
          <SecondaryButton v-if="!showMusicXml && musicXml" class="mt-1" @click="showMusicXml = true">Noot
          </SecondaryButton>
          <SecondaryButton v-if="showMusicXml && chordProSong" class="mt-1" @click="showMusicXml = false">Akordid
          </SecondaryButton>
        </div>
        <div v-if="variatsioonid && variatsioonid.length" class="mb-4">
          <select class="mt-1 w-fit block pl-3 pr-10 py-2 text-base focus:outline-none sm:text-sm rounded-md dark:text-white dark:bg-gray-900 dark:border-gray-600 border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" 
            @change="selectedVarChanged" v-model="selectedVar">
            <option value="">Vali variatsioon</option>
            <option v-for="v in variatsioonid" :key="v!.id" :value="v">{{ v!.nimetus }}</option>
          </select>
        </div>
        <h1 class="font-bold text-3xl mx-auto w-fit">{{ laul?.nimi }}</h1>
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
<script setup lang="ts">
import { ref, onMounted, computed, onUpdated } from 'vue'
import { useHead } from "@unhead/vue"
import { ApiResult } from "@servicestack/client"
import { useClient, useAuth } from "@servicestack/vue"
import { QueryLaulud, QueryResponse, QueryVariatsioonid, Variatsioon } from "@/dtos"
import { ChordProParser, Key, HtmlDivFormatter } from 'chordsheetjs'
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay'
import { Laul } from '@/dtos'
import { useRoute } from 'vue-router'
import { MAJOR_KEYS, MINOR_KEYS, TRANSPOSE_KEY_VALUE } from "@/keys"
import { ExtendedTransposeCalculator } from '@/ExtendedTransposeCalculator'
import type { ETCDirections } from '@/ETC'

const route = useRoute()
const id = computed(() => (route.params as any)?.id)

const client = useClient()
const api = ref(new ApiResult())

const { hasRole } = useAuth()
const canEdit = computed(() => hasRole('Sisestaja'))
const isEditMode = ref(false)
const showAddVar = ref(false)
const showEditVar = ref(false)
const showModal = ref(false)

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

const formatter = new HtmlDivFormatter({
  normalizeChords: true,
  evaluate: true,
})

const chordProParser = new ChordProParser()
const showMusicXml = ref(false)

const chordProSong = ref()
const musicXml = ref()
const activeOrigKey = ref()

const selectedVarChanged = () => {
  if (selectedVar.value) {
    musicXml.value = selectedVar.value.musicXml
    chordProSong.value = selectedVar.value.chordPro ? chordProParser.parse(selectedVar.value.chordPro) : null
    activeOrigKey.value = selectedVar.value.helistik
  } else {
    musicXml.value = laul.value!.musicXml
    chordProSong.value = laul.value!.chordPro ? chordProParser.parse(laul.value!.chordPro) : null
    activeOrigKey.value = laul.value!.helistik
  }
}

const currentKey = ref<string>()

const laul = ref<Laul>()
const variatsioonid = ref<(Variatsioon | null)[]>()

const selectedVar = ref<Variatsioon | null>()

const chordProHtml = computed(() => {
  if (!chordProSong.value) {
    return "";
  }
  return formatter.format(chordProSong.value)
})

const osmdRef = ref()
let osmd: OpenSheetMusicDisplay | null = null

onMounted(async () => await refresh())

const refresh = async () => {
  api.value = await client.api(new QueryLaulud({ id: id.value }))
  if (api.value.succeeded) {
    laul.value = (api.value.response as QueryResponse<Laul>).results[0]
    currentKey.value = laul.value.helistik
    useHead({ title: laul.value.nimi })
    if (laul.value.chordPro) {
      chordProSong.value = chordProParser.parse(laul.value.chordPro)
    }
    showMusicXml.value = laul.value.musicXml != null
    musicXml.value = laul.value.musicXml
    activeOrigKey.value = laul.value.helistik
    await queryVariatsioonid()
  }
}

const queryVariatsioonid = async () => {
  const varApi = await client.api(new QueryVariatsioonid({ laulId: laul.value?.id }))
  if (varApi.succeeded && varApi.response?.results.length) {
    const response = varApi.response as unknown as QueryResponse<Variatsioon>
    variatsioonid.value = response.results
  }
}

const editDone = (cancelled: boolean) => {
  isEditMode.value = false
  showModal.value = false
  if (!cancelled)
    refresh()
}

const addVarDone = async (cancelled: boolean) => {
  showAddVar.value = false
  showModal.value = false
  if (!cancelled)
    await queryVariatsioonid()
}

const editVarDone = async (cancelled: boolean) => {
  showEditVar.value = false
  showModal.value = false
  if (!cancelled)
    await queryVariatsioonid()
}

onUpdated(async () => {
  if (musicXml.value) {
    await renderMusicXml()
  }
})

const restoreOrigKey = () => {
  currentKey.value = laul.value?.helistik
  setKey()
}

const selectableKeys = computed<string[]>(() => {
  const keyObj = Key.wrapOrFail(laul.value!.helistik)
  return keyObj.isMinor()
    ? MINOR_KEYS
    : MAJOR_KEYS
})

const setKey = async () => {
  if (chordProSong.value) {
    const transposeDistance = chordProSong.value.getTransposeDistance(currentKey.value)
    let transposedSong = chordProSong.value.transpose(transposeDistance, {
      normalizeChordSuffix: true,
    })
    if (transposedSong.key != currentKey.value) {
      transposedSong = transposedSong.transposeUp().transposeDown()
    }
    if (transposedSong.key != currentKey.value) {
      transposedSong = transposedSong.transposeDown().transposeUp()
    }
    chordProSong.value = transposedSong
  }
}

const renderMusicXml = async () => {
  if (!musicXml.value || !currentKey.value) {
    return
  }
  if (!osmd) {
    osmd = new OpenSheetMusicDisplay(osmdRef.value, osmdOptions)
  }
  osmd.clear()

  await osmd.load(musicXml.value)
  osmd.Zoom = 0.7
  let transposeCalc = new ExtendedTransposeCalculator(osmd)
  osmd.TransposeCalculator = transposeCalc
  const distance = Key.distance(activeOrigKey.value, currentKey.value!)
  const direction: ETCDirections = 12 - distance >= distance ? "up" : "down"
  transposeCalc.Options.TransposeDirection = direction
  transposeCalc.Options.transposeToKeyRelation(TRANSPOSE_KEY_VALUE[currentKey.value])
  osmd?.updateGraphic()
  osmd.render()
}

const osmdOptions = {
  backend: "svg",
  drawTitle: false,
  darkMode: false,
  pageBackgroundColor: "#12345600",
}
</script>