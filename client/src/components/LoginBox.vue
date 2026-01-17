<template>
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
          >Podaj swój nick</label
        >
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
      <button
        class="w-full px-6 py-3 font-semibold text-white bg-emerald-700 rounded-md shadow-md hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-gray-800 transition-colors cursor-pointer"
        type="submit"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Łączenie...' : 'Dołącz' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { LoginResponse } from '@app/shared'

// Define events emitted by this component
const emit = defineEmits<{
  (e: 'login-success', payload: LoginResponse): void
}>()

// Reactive state for the input field
const nickname = ref('')
// Reactive state for error messages
const errorMessage = ref('')
// Reactive state for loading status
const isLoading = ref(false)

/**
 * Handles the login form submission.
 * Validates input, sends a request to the server, and emits success event.
 */
const handleLogin = async () => {
  // Reset error message
  errorMessage.value = ''

  // Basic validation
  if (!nickname.value) {
    errorMessage.value = 'Nickname nie może być pusty.'
    return
  }

  // Set loading state
  isLoading.value = true

  try {
    // Send login request to the server
    const response = await fetch(`/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nickname: nickname.value }),
    })

    const data: LoginResponse = await response.json()

    if (!response.ok) {
      throw new Error((data as any).message || 'Wystąpił błąd logowania.')
    }

    // Emit success event with user data
    emit('login-success', data)
  } catch (error) {
    // Display error message to the user
    errorMessage.value = (error as Error).message
  } finally {
    // Reset loading state
    isLoading.value = false
  }
}
</script>
