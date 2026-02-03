<template>
  <button
    class="px-6 py-3 font-semibold text-white bg-emerald-700 rounded-md shadow-md hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <slot />
  </button>
</template>

<script setup lang="ts"></script>
