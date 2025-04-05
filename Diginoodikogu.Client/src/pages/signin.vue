<script setup lang="ts">
  import { revalidate } from '@/auth'
  import { Authenticate } from '@/dtos'
  import { getRedirect } from '@/routing'
  import { serializeToObject } from '@servicestack/client'
  import { useAuth, useClient } from '@servicestack/vue'
  import { nextTick, ref, watchEffect } from 'vue'
  import { useRouter } from 'vue-router'

  const client = useClient()
  const { user, signIn } = useAuth()
  const username = ref('')
  const password = ref('')
  const router = useRouter()

  const stop = watchEffect(() => {
    if (user.value) {
      router.push(getRedirect(router) ?? '/')
      nextTick(() => stop())
    }
  })

  function setUser(email: string) {
    username.value = email
    password.value = 'p@55wOrd'
  }

  async function onSubmit(e: Event) {
    const { userName, password, rememberMe } = serializeToObject(
      e.currentTarget as HTMLFormElement
    )
    const api = await client.api(
      new Authenticate({
        provider: 'credentials',
        userName,
        password,
        rememberMe,
      })
    )
    if (api.succeeded) {
      signIn(api.response!)
      await revalidate()
    }
  }
</script>

<template>
  <div class="mt-8 mx-auto max-w-lg">
    <div class="max-w-xl">
      <h1
        class="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
        Logi sisse oma kasutajaga.
      </h1>
      <section class="mt-4 sm:shadow overflow-hidden sm:rounded-md">
        <form @submit.prevent="onSubmit">
          <div>
            <ErrorSummary except="userName,password,rememberMe" />
            <div class="px-4 py-5 bg-white dark:bg-black space-y-6 sm:p-6">
              <div class="flex flex-col gap-y-4">
                <TextInput
                  id="userName"
                  label="E-mail"
                  placeholder="E-mail"
                  help="E-mail, millega kasutaja registreerisid"
                  v-model="username" />
                <TextInput
                  id="password"
                  label="Parool"
                  placeholder="Parool"
                  type="password"
                  help="6 või rohkem tähemärki"
                  v-model="password" />
                <CheckboxInput id="rememberMe" label="Jäta mind meelde" />
              </div>

              <div>
                <PrimaryButton id="login-submit" type="submit"
                  >Logi sisse</PrimaryButton
                >
              </div>

              <div class="mt-8 text-sm">
                <p class="mb-3">
                  <RouterLink class="font-semibold" to="/signup"
                    >Registreeri uus kasutaja</RouterLink
                  >
                </p>
              </div>
            </div>
          </div>
        </form>
      </section>
      <div class="mt-8">
        <h3 class="xs:block mr-4 leading-8 text-gray-500">Quick Links</h3>
        <div class="flex flex-wrap max-w-lg gap-2">
          <SecondaryButton type="button" @click="setUser('admin@email.com')">
            admin@email.com
          </SecondaryButton>
          <SecondaryButton type="button" @click="setUser('manager@email.com')">
            manager@email.com
          </SecondaryButton>
          <SecondaryButton type="button" @click="setUser('employee@email.com')">
            employee@email.com
          </SecondaryButton>
          <SecondaryButton type="button" @click="setUser('new@user.com')">
            new@user.com
          </SecondaryButton>
        </div>
      </div>
    </div>
  </div>
</template>
