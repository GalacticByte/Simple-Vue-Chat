<template>
  <div class="w-full flex flex-col items-center">
    <TheHeader />
    <main class="w-full flex justify-center">
      <div
        class="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-xl shadow-lg shadow-emerald-500/20 text-gray-100"
      >
        <form
          class="flex flex-col items-center w-full gap-8"
          novalidate
          @submit.prevent="handleLogin"
        >
          <h2 class="text-2xl font-bold text-center uppercase">
            Witaj w aplikacji czat
          </h2>
          <div class="w-full">
            <label
              for="nickname"
              class="block mb-2 text-sm font-medium text-left text-gray-300"
            >
              Podaj swój nick
            </label>
            <input
              id="nickname"
              type="text"
              v-model="nickname"
              placeholder="Podaj swój nick"
              autocomplete="off"
              :aria-invalid="!!errorMessage"
              :aria-describedby="errorMessage ? 'login-error' : undefined"
              class="block w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <div
              v-if="errorMessage"
              id="login-error"
              role="alert"
              class="mt-2 text-sm text-red-500"
            >
              {{ errorMessage }}
            </div>
          </div>
          <BaseButton type="submit" :disabled="isLoading" class="w-full">
            {{ isLoading ? 'Łączenie...' : 'Dołącz' }}
          </BaseButton>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TheHeader from '../components/TheHeader.vue'
import BaseButton from '../components/BaseButton.vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const nickname = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  errorMessage.value = ''

  if (!nickname.value) {
    errorMessage.value = 'Nickname nie może być pusty.'
    return
  }

  isLoading.value = true

  try {
    await authStore.login(nickname.value)
  } catch (error) {
    errorMessage.value = (error as Error).message
  } finally {
    isLoading.value = false
  }
}
</script>
