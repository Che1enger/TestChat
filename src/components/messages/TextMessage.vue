<script setup lang="ts">
import type { TextMessage } from '../../types/messages'
import '../../styles/TextMessage.css'

defineProps<{
  message: TextMessage
}>()
</script>

<template>
  <p class="text-message">
    {{ message.text }}
  </p>
</template>

