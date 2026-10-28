<script setup>
// Знак «Литеры»: буква «Л» как скат крыши, окно и линия фундамента цвета латуни
defineProps({ size: { type: Number, default: 38 }, color: { type: String, default: 'var(--brand)' } })
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
    <path d="M31 33 20 7 11.4 27.6C10.3 30.6 8.6 32.6 6 33" fill="none" :stroke="color" stroke-width="2.4" />
    <path d="M2.5 33.6h35" stroke="var(--brass)" stroke-width="1.3" />
    <rect x="18.3" y="21.2" width="3.4" height="5.2" fill="var(--brass)" />
  </svg>
</template>
