<script setup lang="ts">
import type { TextMessage } from '../../types/messages'

defineProps<{
  message: TextMessage
}>()
</script>

<template>
  <p class="text-message">
    {{ message.text }}
  </p>
</template>

<style>
@import '../../styles/TextMessage.css';
</style>

