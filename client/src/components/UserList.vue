<template>
  <div
    class="h-full flex flex-col bg-gray-800 shadow-lg shadow-emerald-500/20 rounded-xl overflow-hidden"
    :class="isPreview ? 'hidden md:flex' : 'flex'"
  >
    <div class="flex items-center gap-2 border-b border-gray-700 px-3 h-14">
      <h3
        id="online-users-title"
        class="flex-1 text-left md:text-center text-gray-400 uppercase font-semibold"
      >
        Użytkownicy Online:
      </h3>
      <button
        class="w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        aria-label="Wyloguj"
        title="Wyloguj"
        @click="$emit('logout')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          aria-hidden="true"
          class="h-6 w-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
          />
        </svg>
      </button>

      <button
        class="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        @click="$emit('close')"
        aria-label="Zamknij listę użytkowników"
      >
        ✕
      </button>
    </div>

    <ul class="overflow-y-auto p-2 grow" aria-labelledby="online-users-title">
      <li
        v-for="u in users"
        :key="u.id"
        class="text-emerald-400 font-semibold p-2 text-left list-none rounded-md transition-colors duration-200 hover:bg-gray-700"
      >
        {{ u.username }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

export interface UserVM {
  id: string
  username: string
}

defineProps({
  users: {
    type: Array as PropType<readonly UserVM[]>,
    required: true,
  },
  isPreview: {
    type: Boolean,
    default: false,
  },
})

defineEmits<{
  (e: 'logout'): void
  (e: 'close'): void
}>()
</script>
