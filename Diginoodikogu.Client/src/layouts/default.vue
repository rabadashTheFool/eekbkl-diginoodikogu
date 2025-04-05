<script setup lang="ts">
  import { useApp } from '@/api'
  import NavHeader from '@/components/NavHeader.vue'

  let app = useApp()
  app.load()
</script>

<template>
  <NavHeader />

  <div class="min-h-screen">
    <main role="main">
      <RouterView />
    </main>
  </div>

  <!--<NavFooter />-->
</template>
