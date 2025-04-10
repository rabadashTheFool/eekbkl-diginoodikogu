<script setup lang="ts">
  import { CreateVariatsioon } from '@/dtos'
  import { MAJOR_KEYS, MINOR_KEYS } from '@/keys'
  import { useClient } from '@servicestack/vue'
  import { computed, ref } from 'vue'

  const props = defineProps<{
    laulId: string
  }>()

  const emit = defineEmits<{
    (e: 'done', cancelled: boolean): void
  }>()

  const visibleFields = 'nimetus,kogumik,helistik,chordPro,musicXml'

  const onChordProFileChange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.item(0)
    if (file) {
      request.value.chordPro = await readUploadedFileAsText(file)
    } else {
      request.value.chordPro = undefined
    }
  }

  const onMusicXmlFileChange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.item(0)
    if (file) {
      request.value.musicXml = await readUploadedFileAsText(file)
    } else {
      request.value.musicXml = undefined
    }
  }

  const toggleIsMinor = () => {
    isMinor.value = !isMinor.value
  }

  const client = useClient()
  const isMinor = ref(false)
  const selectableKeys = computed(() => {
    return isMinor.value ? MINOR_KEYS : MAJOR_KEYS
  })

  const request = ref(new CreateVariatsioon())

  async function submit() {
    request.value.laulId = props.laulId
    const api = await client.api(request.value)
    if (api.succeeded) {
      emit('done', false)
    }
  }

  const readUploadedFileAsText = (inputFile: File): Promise<string> => {
    const temporaryFileReader = new FileReader()
    return new Promise((resolve, reject) => {
      temporaryFileReader.onerror = () => {
        temporaryFileReader.abort()
        reject(new DOMException('Problem parsing input file.'))
      }
      temporaryFileReader.onload = () => {
        resolve(temporaryFileReader.result as string)
      }
      temporaryFileReader.readAsText(inputFile)
    })
  }

  const cancel = () => {
    emit('done', true)
  }
</script>

<template>
  <form @submit.prevent="submit">
    <div class="shadow sm:overflow-hidden sm:rounded-md">
      <div class="space-y-6 py-6 px-4 sm:p-6 bg-white dark:bg-black">
        <div>
          <h3
            class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
            Lisa variatsioon
          </h3>
        </div>
        <fieldset>
          <ErrorSummary :except="visibleFields" class="mb-4" />
          <div>
            <div class="mb-4">
              <TextInput
                id="nimi"
                v-model="request.nimetus"
                required
                placeholder="Variatsiooni nimi" />
            </div>
            <div class="mb-4">
              <SelectInput
                label="Helistik"
                class="mb-2 w-fit"
                v-model="request.helistik"
                required
                :values="selectableKeys" />
              <div class="flex">
                <span class="mr-2">Minoor</span>
                <button
                  type="button"
                  class="bg-gray-200 dark:bg-gray-700 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:ring-offset-black"
                  role="switch"
                  aria-checked="false"
                  @click="toggleIsMinor">
                  <span
                    :class="`${
                      !isMinor ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white dark:bg-black shadow transform ring-0 transition ease-in-out duration-200`">
                    <span
                      :class="`${
                        !isMinor
                          ? 'opacity-0 ease-out duration-100'
                          : 'opacity-100 ease-in duration-200'
                      } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`"
                      aria-hidden="true">
                    </span>
                    <span
                      :class="`${
                        !isMinor
                          ? 'opacity-100 ease-in duration-200'
                          : 'opacity-0 ease-out duration-100'
                      } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`"
                      aria-hidden="true">
                    </span>
                  </span>
                </button>
                <span class="ml-2">Mažoor</span>
              </div>
            </div>
            <div class="mb-4">
              <div class="flex justify-between">
                <div class="relative flex-grow mr-2 sm:mr-4">
                  <label
                    for="chordPro"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >ChordPro</label
                  >
                  <div class="block mt-2">
                    <span class="sr-only">ChordPro</span>
                    <input
                      type="file"
                      name="chordPro"
                      id="chordPro"
                      accept=".txt,.chordpro,.pro"
                      @change="onChordProFileChange"
                      class="block w-full sm:text-sm rounded-md dark:bg-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 dark:file:bg-violet-900 file:text-violet-700 dark:file:text-violet-200 hover:file:bg-violet-100 dark:hover:file:bg-violet-800 text-slate-500 dark:text-slate-400"
                      placeholder="ChordPro"
                      aria-invalid="false"
                      aria-describedby="chordPro-error" />
                  </div>
                  <p
                    v-if="request.chordPro"
                    class="mt-1 text-sm text-gray-500 dark:text-gray-300">
                    {{ request.chordPro.substring(0, 50) + '...' }}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div class="flex justify-between">
                <div class="relative flex-grow mr-2 sm:mr-4">
                  <label
                    for="musicXml"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >MusicXML</label
                  >
                  <div class="block mt-2">
                    <span class="sr-only">MusicXML</span>
                    <input
                      type="file"
                      name="musicXml"
                      id="musicXml"
                      accept=".xml,.musicxml,.mxl"
                      @change="onMusicXmlFileChange"
                      class="block w-full sm:text-sm rounded-md dark:bg-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 dark:file:bg-violet-900 file:text-violet-700 dark:file:text-violet-200 hover:file:bg-violet-100 dark:hover:file:bg-violet-800 text-slate-500 dark:text-slate-400"
                      placeholder="MusicXML"
                      aria-invalid="false"
                      aria-describedby="musicXml-error" />
                  </div>
                  <p
                    class="mt-1 text-sm text-gray-500 dark:text-gray-300"
                    v-if="request.musicXml">
                    {{ request.musicXml.substring(0, 50) + '...' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </fieldset>
      </div>
      <div
        class="mt-4 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-right sm:px-12">
        <div class="flex justify-between space-x-3">
          <div>
            <SecondaryButton class="mr-4" @click="cancel"
              >Tagasi</SecondaryButton
            >
          </div>
          <div>
            <PrimaryButton type="submit">Lisa</PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>
