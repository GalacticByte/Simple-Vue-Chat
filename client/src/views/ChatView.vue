<template>
  <div class="w-full flex flex-col h-full">
    <TheHeader :show-menu-button="true" @toggle-menu="isUserListOpen = true" />

    <main class="relative flex flex-col md:flex-row w-full gap-4 h-[80vh]">
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
          @logout="authStore.logout()"
          @close="isUserListOpen = false"
        />
      </Transition>

      <div
        class="flex-1 w-full flex flex-col h-full bg-gray-800 shadow-lg shadow-emerald-500/20 rounded-xl overflow-hidden"
      >
        <!-- Backdrop for closing the context menu -->
        <div
          v-if="activeMenuId"
          class="fixed inset-0 z-40"
          @click="activeMenuId = null"
        ></div>

        <div
          class="grow overflow-y-auto p-4 space-y-4"
          ref="chatArea"
          role="log"
          aria-live="polite"
        >
          <TransitionGroup name="list" tag="div">
            <div
              v-for="m in messagesVM"
              :key="m.id"
              class="flex"
              :class="m.isMine ? 'justify-end' : 'justify-start'"
            >
              <!-- Apply z-index to the active message to ensure the menu appears above others -->
              <div
                class="mb-6 relative"
                :class="{ 'z-50': activeMenuId === m.id }"
              >
                <b
                  class="block text-sm font-semibold mb-2"
                  :class="
                    m.isMine
                      ? 'text-emerald-500 text-right'
                      : 'text-gray-400 text-left'
                  "
                >
                  {{ m.author }}
                </b>
                <!-- Flex container for message and options button -->
                <div
                  class="flex items-center gap-2"
                  :class="m.isMine ? 'flex-row-reverse' : ''"
                >
                  <p
                    class="mt-1 max-w-xs lg:max-w-md p-3 rounded-lg wrap-break-word my-2"
                    :class="
                      m.isMine
                        ? 'bg-emerald-700 text-white'
                        : 'bg-gray-700 text-gray-200'
                    "
                  >
                    {{ m.message }}
                  </p>
                  <!-- Context menu for user's own messages -->
                  <div v-if="m.isMine" class="relative">
                    <button
                      @click.stop="toggleMenu(m.id)"
                      class="p-1 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      aria-label="Opcje wiadomości"
                      :aria-expanded="activeMenuId === m.id"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                        class="w-6 h-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 6.75a.75.75 0 110-1.5 .75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5 .75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5 .75.75 0 010 1.5z"
                        />
                      </svg>
                    </button>
                    <!-- Dropdown menu with options -->
                    <div
                      v-if="activeMenuId === m.id"
                      class="absolute right-0 mt-1 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden"
                    >
                      <button
                        @click="deleteMessage(m.id)"
                        class="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2 transition-colors focus:outline-none focus:bg-gray-700 cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          aria-hidden="true"
                          class="w-4 h-4"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                        Usuń
                      </button>
                    </div>
                  </div>
                </div>
                <small
                  class="block mt-1 text-xs"
                  :class="
                    m.isMine
                      ? 'text-gray-300 text-right'
                      : 'text-gray-400 text-left'
                  "
                >
                  {{ dateFormatter.format(new Date(m.createdAt)) }}
                </small>
              </div>
            </div>
          </TransitionGroup>
          <output
            v-if="chatStore.typingUsers.length"
            class="block px-4 pb-2 text-sm text-emerald-400 italic animate-pulse"
          >
            <span v-for="u in chatStore.typingUsers" :key="u.id">
              {{ u.nickname }} pisze...
            </span>
          </output>
        </div>

        <form
          class="p-4 border-t border-gray-700 w-full flex items-end gap-4"
          novalidate
          @submit.prevent="sendMessage"
        >
          <div class="grow">
            <label
              for="message"
              class="block text-sm font-medium text-gray-300 mb-2"
            >
              Napisz wiadomość:
            </label>
            <input
              id="message"
              type="text"
              v-model="message"
              autocomplete="off"
              placeholder="Cześć co u Ciebie?"
              @input="onInput"
              :aria-invalid="!!errorSendMsg"
              :aria-describedby="errorSendMsg ? 'send-error' : undefined"
              class="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div
              v-if="errorSendMsg"
              id="send-error"
              role="alert"
              class="mt-1 text-sm text-red-500"
            >
              {{ errorSendMsg }}
            </div>
          </div>
          <BaseButton type="submit" class="py-2"> Wyślij </BaseButton>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import type { MessageDTO, UserDTO } from '@app/shared'
import TheHeader from '../components/TheHeader.vue'
import BaseButton from '../components/BaseButton.vue'
import UserList from '../components/UserList.vue'
import { useChatStore } from '../stores/chat'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const chatStore = useChatStore()

// --- UI State ---
const isUserListOpen = ref(false)
const isDesktop = ref(window.innerWidth >= 768)

const updateViewport = () => {
  isDesktop.value = window.innerWidth >= 768
  if (isDesktop.value) {
    isUserListOpen.value = true
  }
}

const message = ref('')
const errorSendMsg = ref('')
let typingTimeout: number | undefined
const chatArea = ref<HTMLDivElement | null>(null)
const activeMenuId = ref<string | null>(null)

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

// --- Lifecycle ---
onMounted(() => {
  updateViewport()
  window.addEventListener('resize', updateViewport)
  // Connect on mount using the token passed from App.vue
  chatStore.connect(authStore.token)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateViewport)
  chatStore.disconnect()
})

// --- View Models ---
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
  chatStore.messages.map((m: MessageDTO) => ({
    id: m.id,
    message: m.message,
    createdAt: m.createdAt,
    author: m.author.nickname ?? 'System',
    isMine: m.author.nickname === authStore.nickname,
  })),
)

const usersVM = computed<UserVM[]>(() =>
  chatStore.users.map((u: UserDTO) => ({
    id: u.id,
    username: u.nickname,
    isMe: u.nickname === authStore.nickname,
  })),
)

// --- Actions ---
const onInput = () => {
  chatStore.setTyping(true)
  clearTimeout(typingTimeout)
  typingTimeout = globalThis.setTimeout(() => {
    chatStore.setTyping(false)
  }, 800)
}

const sendMessage = () => {
  if (!message.value.trim()) {
    errorSendMsg.value = 'Pole nie może być puste'
    return
  }
  chatStore.sendMessage(message.value)
  message.value = ''
  errorSendMsg.value = ''
}

const deleteMessage = (id: string) => {
  chatStore.deleteMessage(id)
  activeMenuId.value = null
}

const toggleMenu = (id: string) => {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

watch(
  messagesVM,
  () => {
    nextTick(() => {
      if (chatArea.value) {
        chatArea.value.scrollTop = chatArea.value.scrollHeight
      }
    })
  },
  { deep: true },
)
</script>
