<script setup lang="ts">
  import { Laul, QueryLaulud, QueryResponse } from '@/dtos'
  import { ApiResult } from '@servicestack/client'
  import { useAuth, useClient } from '@servicestack/vue'
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const { hasRole } = useAuth()
  const canAddNew = computed(() => hasRole('Sisestaja'))

  const client = useClient()
  const api = ref(new ApiResult())

  const laulud = ref<Laul[]>()

  onMounted(async () => {
    api.value = await client.api(new QueryLaulud())
    laulud.value = (api.value.response as QueryResponse<Laul>).results
  })

  const rowSelected = (row: Laul) => {
    router.push('/laulud/' + row.id)
  }
</script>

<template>
  <div class="mt-8 mb-20 mx-auto max-w-fit">
    <h1
      class="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
      Laulud
    </h1>

    <Alert v-if="api.error" type="error">{{ api.error.message }}</Alert>
    <div v-else-if="api.response">
      <PrimaryButton v-if="canAddNew" href="/uus-laul"
        >Lisa uus laul</PrimaryButton
      >
      <DataGrid
        :items="laulud"
        :selected-columns="['nimi', 'kogumikud', 'sonad', 'viis']"
        @rowSelected="rowSelected" />
    </div>
    <Loading v-else class="w-fit mx-auto">Laen...</Loading>
  </div>
</template>
