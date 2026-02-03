<template>
  <header class="relative w-full flex items-center justify-center">
    <button
      v-if="showMenuButton"
      class="md:hidden absolute top-4 left-1 z-30 flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-white shadow"
      @click="$emit('toggleMenu')"
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
</template>

<script setup lang="ts">
defineProps<{
  showMenuButton?: boolean
}>()

defineEmits<(e: 'toggleMenu') => void>()
</script>
