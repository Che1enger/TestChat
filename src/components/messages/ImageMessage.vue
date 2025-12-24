<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import type { ImageMessage } from '../../types/messages'

const props = defineProps<{
  message: ImageMessage
}>()

const isLoaded = ref(false)
const hasError = ref(false)
const imgRef = ref<HTMLImageElement | null>(null)

const handleLoad = () => {
  isLoaded.value = true
}

const handleError = () => {
  hasError.value = true
}

// Check if image is already loaded (from cache)
const checkImageLoaded = () => {
  if (imgRef.value?.complete && imgRef.value.naturalHeight !== 0) {
    isLoaded.value = true
  }
}

onMounted(() => {
  nextTick(() => {
    checkImageLoaded()
  })
})
</script>

<template>
  <div class="image-message">
    <div class="image-frame" :class="{ loading: !isLoaded && !hasError }">
      <img
        ref="imgRef"
        :src="props.message.imageUrl"
        :alt="props.message.caption || 'Attached image'"
        loading="eager"
        :class="{ hidden: hasError || !isLoaded }"
        @load="handleLoad"
        @error="handleError"
      />
      <div v-if="!isLoaded && !hasError" class="image-skeleton">Loading image…</div>
      <div v-if="hasError" class="image-skeleton error">Image failed to load</div>
    </div>
    <p v-if="message.caption" class="caption">
      {{ message.caption }}
    </p>
  </div>
</template>

<style>
@import '../../styles/ImageMessage.css';
</style>

