<script setup lang="ts">
import type { VideoMessage } from '../../types/messages'
import '../../styles/VideoMessage.css'

defineProps<{
  message: VideoMessage
}>()
</script>

<template>
  <div class="video-message">
    <div class="video-frame">
      <video
        :src="message.videoUrl"
        controls
        preload="metadata"
        class="video-player"
      />
    </div>
    <p v-if="message.caption" class="caption">
      {{ message.caption }}
    </p>
  </div>
</template>
