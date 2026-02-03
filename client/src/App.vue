<template>
  <div
    class="bg-gray-900 text-gray-200 min-h-screen flex flex-col items-center p-4 font-sans"
  >
    <LoginView v-if="!authStore.isAuthenticated" />
    <ChatView v-else />
  </div>
</template>

<script setup lang="ts">
import LoginView from './views/LoginView.vue'
import ChatView from './views/ChatView.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
</script>
