<script setup lang="ts">
  import { signout } from '@/auth'
  import type { AuthenticateResponse } from '@/dtos'
  import { useAuth } from '@servicestack/vue'
  import { useHead } from '@unhead/vue'

  useHead({ title: 'My Profile' })

  const { user, hasRole } = useAuth()
  const roles = user.value?.roles ?? []
</script>

<template>
  <div class="mt-8 mb-20 mx-auto max-w-fit text-center">
    <h1
      class="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
      My Profile
    </h1>

    <Iconify
      icon="mdi:shield-account"
      v-if="hasRole('Admin')"
      class="w-36 h-36 text-gray-700 inline-block" />
    <Iconify
      icon="mdi:account-circle"
      v-else
      class="w-36 h-36 text-gray-700 inline-block" />
    <div>{{ (user as AuthenticateResponse).displayName }}</div>
    <div>{{ (user as AuthenticateResponse).userName }}</div>
    <div class="mt-2">
      <span
        v-for="role in roles"
        :key="role"
        class="ml-3 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium leading-5 bg-indigo-100 text-indigo-800">
        {{ role }}
      </span>
    </div>
    <SecondaryButton class="mt-8" @click="signout($router)"
      >Sign Out</SecondaryButton
    >
  </div>
</template>
