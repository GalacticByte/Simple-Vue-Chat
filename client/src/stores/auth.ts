import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LoginResponse } from '@app/shared'

export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  const token = ref<string>(localStorage.getItem('token') || '')
  const nickname = ref<string | null>(localStorage.getItem('nickname') || null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!nickname.value)

  // Actions
  const login = async (userNickname: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL || ''}/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: userNickname }),
      },
    )

    const data: LoginResponse = await response.json()

    if (!response.ok) {
      throw new Error((data as any).message || 'Wystąpił błąd logowania.')
    }

    // Update state and localStorage
    token.value = data.token
    nickname.value = data.nickname
    localStorage.setItem('token', data.token)
    localStorage.setItem('nickname', data.nickname)
  }

  const logout = () => {
    token.value = ''
    nickname.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('nickname')
  }

  return {
    token,
    nickname,
    isAuthenticated,
    login,
    logout,
  }
})
