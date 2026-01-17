<template>
  <div
    class="flex flex-col h-full bg-gray-800 shadow-lg shadow-emerald-500/20 rounded-xl overflow-hidden"
    :class="[isPreview ? ' md:flex' : 'flex']"
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
          v-for="m in messages"
          :key="m.id"
          class="flex"
          :class="m.isMine ? 'justify-end' : 'justify-start'"
        >
          <!-- Apply z-index to the active message to ensure the menu appears above others -->
          <div class="mb-6 relative" :class="{ 'z-50': activeMenuId === m.id }">
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
      <div
        v-if="typingUsers.length"
        class="px-4 pb-2 text-sm text-emerald-400 italic animate-pulse"
        role="status"
      >
        <span v-for="u in typingUsers" :key="u.id">
          {{ u.nickname }} pisze...
        </span>
      </div>
    </div>

    <form
      class="p-4 border-t border-gray-700 w-full flex items-end gap-4"
      novalidate
      @submit.prevent="$emit('sendMessage')"
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
          :value="message"
          autocomplete="off"
          placeholder="Cześć co u Ciebie?"
          @input="handleInput"
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
      <button
        type="submit"
        class="px-6 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 rounded-md transition-all duration-300 ease-in-out cursor-pointer"
      >
        Wyślij
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { UserDTO } from '@app/shared'
import { ref, nextTick, watch, type PropType } from 'vue'

export interface ChatMessageVM {
  id: string
  message: string
  createdAt: string
  author: string
  isMine: boolean
}

const props = defineProps({
  isPreview: {
    type: Boolean,
    default: false,
  },
  messages: {
    type: Array as PropType<readonly ChatMessageVM[]>,
    required: true,
  },
  message: { type: String, required: true },
  errorSendMsg: { type: String, required: true },
  typingUsers: {
    type: Array as PropType<readonly UserDTO[]>,
    required: true,
  },
})

const emit = defineEmits<{
  (e: 'sendMessage'): void
  (e: 'update:message', value: string): void
  (e: 'typing'): void
  (e: 'deleteMessage', id: string): void
}>()

const chatArea = ref<HTMLDivElement | null>(null)

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

// Holds the ID of the message whose context menu is currently active
const activeMenuId = ref<string | null>(null)

// Toggles the visibility of the context menu for a given message ID
const toggleMenu = (id: string) => {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

// Emits an event to delete a message and closes the menu
const deleteMessage = (id: string) => {
  emit('deleteMessage', id)
  // Close the menu after action
  activeMenuId.value = null
}

const handleInput = (event: Event) => {
  emit('update:message', (event.target as HTMLInputElement).value)
  emit('typing')
}

watch(
  () => props.messages,
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
