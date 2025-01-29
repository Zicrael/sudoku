<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :height="height"
    :width="width"
    :fill="color"
    :viewBox="viewBox"
  >
    <slot />
  </svg>
</template>

<script setup lang="ts">
// Props for customizing the icon
defineProps({
  height: {
    type: String,
    default: '24px',
  },
  width: {
    type: String,
    default: '24px',
  },
  color: {
    type: String,
    default: '#003d5c',
  },
  viewBox: {
    type: String,
    default: '0 -960 960 960',
  },
})
</script>
