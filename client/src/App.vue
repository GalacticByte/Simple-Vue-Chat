<template>
  <div
    class="bg-gray-900 text-gray-200 min-h-screen flex flex-col items-center p-4 font-sans"
  >
    <header class="relative w-full flex items-center justify-center">
      <button
        v-if="isReady"
        class="md:hidden absolute top-4 left-1 z-30 flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-white shadow"
        @click="isUserListOpen = true"
        aria-label="Pokaż listę użytkowników"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m6-4a4 4 0 11-8 0 4 4 0 018 0zm6 4a4 4 0 10-8 0"
          />
        </svg>
      </button>

      <h1 class="text-3xl md:text-4xl font-bold text-emerald-400 my-4 md:my-6">
        Czat Lite
      </h1>
    </header>

    <!-- LOGIN -->
    <main v-if="!isReady" class="w-full flex justify-center">
      <LoginBoxComponent @login-success="handleLoginSuccess" />
    </main>

    <!-- CHAT -->
    <main
      v-else
      class="relative flex flex-col md:flex-row w-full gap-4 h-[80vh]"
    >
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isUserListOpen"
          class="fixed inset-0 bg-black/40 z-30 md:hidden"
          @click="isUserListOpen = false"
        />
      </Transition>

      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        enter-from-class="-translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition-transform duration-200 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="-translate-x-full"
      >
        <UserList
          v-if="isUserListOpen || isDesktop"
          class="fixed inset-y-0 left-0 z-40 w-[90%] max-w-md bg-gray-800 md:static md:w-[35%]"
          :users="usersVM"
          @logout="logout"
          @close="isUserListOpen = false"
        />
      </Transition>

      <ChatBoxComponent
        class="flex-1 w-full"
        :messages="messagesVM"
        :errorSendMsg="errorSendMsg"
        v-model:message="message"
        @sendMessage="sendMessage"
        :isPreview="true"
        :typingUsers="typingUsers"
        @typing="onInput"
        @deleteMessage="deleteMessage"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import type { MessageDTO, UserDTO, LoginResponse } from '@app/shared'

import { ref, computed, onMounted, onUnmounted } from 'vue'

import LoginBoxComponent from './components/LoginBox.vue'
import ChatBoxComponent from './components/ChatBox.vue'
import UserList from './components/UserList.vue'
import { useChat } from './composables/useChat'

const isUserListOpen = ref(false)
const isDesktop = ref(window.innerWidth >= 768)

const updateViewport = () => {
  isDesktop.value = window.innerWidth >= 768
  if (isDesktop.value) {
    isUserListOpen.value = true
  }
}

onMounted(() => {
  updateViewport()
  window.addEventListener('resize', updateViewport)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateViewport)
})

// =======================
// Chat (transport + state)
// =======================
const {
  messages,
  users,
  connect,
  sendMessage: sendChatMessage,
  messageDeleted,
  setTyping,
  typingUsers,
  disconnect,
} = useChat()

// =======================
// View state
// =======================
const message = ref('')
const isReady = ref(false)
const errorSendMsg = ref('')

// current user (from login)
const myNickname = ref<string | null>(null)

let typingTimeout: number | undefined

// =======================
// DTO → ViewModel mapping
// =======================
type ChatMessageVM = {
  id: string
  message: string
  createdAt: string
  author: string
  isMine: boolean
}
type UserVM = {
  id: string
  username: string
  isMe: boolean
}

const messagesVM = computed<ChatMessageVM[]>(() =>
  messages.value.map((m: MessageDTO) => ({
    id: m.id,
    message: m.message,
    createdAt: m.createdAt,
    author: m.author.nickname ?? 'System',
    isMine: m.author.nickname === myNickname.value,
  })),
)

const usersVM = computed<UserVM[]>(() =>
  users.value.map((u: UserDTO) => ({
    id: u.id,
    username: u.nickname,
    isMe: u.nickname === myNickname.value,
  })),
)

// =======================
// Login flow
// =======================
const handleLoginSuccess = (data: LoginResponse) => {
  // save token (for reconnect / refresh)
  localStorage.setItem('token', data.token)

  myNickname.value = data.nickname

  // socket.io connect
  connect(data.token)

  // show chat
  isReady.value = true
}

// =======================
// Logout user
// =======================

const logout = () => {
  localStorage.removeItem('token')
  disconnect()
  isReady.value = false
  myNickname.value = null
}

// =======================
// Is typing
// =======================

const onInput = () => {
  setTyping(true)

  clearTimeout(typingTimeout)
  typingTimeout = window.setTimeout(() => {
    setTyping(false)
  }, 800)
}

// =======================
// Send message
// =======================
const sendMessage = () => {
  if (!message.value.trim()) {
    errorSendMsg.value = 'Pole nie może być puste'
    return
  }

  sendChatMessage(message.value)
  message.value = ''
  errorSendMsg.value = ''
}

// =======================
// Delete message
// =======================
const deleteMessage = (id: string) => {
  messageDeleted(id)
}
</script>
