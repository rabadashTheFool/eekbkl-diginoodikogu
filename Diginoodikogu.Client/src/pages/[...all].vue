<script setup lang="ts">
  import { useRouter } from 'vue-router'
  const router = useRouter()
</script>

<template>
  <div>
    <div class="flex items-center">
      <h1
        class="inline-block border-gray-300 border-r m-0 mr-5 py-2 pr-4 text-2xl font-medium">
        404
      </h1>
      <div class="inline-block text-left">
        <h2 class="text-sm font-normal">Sellist lehekülge pole olemas.</h2>
      </div>
    </div>
    <div class="mt-2">
      <button
        @click="router.back()"
        class="inline-flex justify-center py-1 px-2 shadow rounded-sm text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
        <Iconify icon="mdi:arrow-left-thin" class="w-5 h-5" />
        Tagasi
      </button>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: empty
</route>
