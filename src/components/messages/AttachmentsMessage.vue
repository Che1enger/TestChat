<script setup lang="ts">
import { computed } from 'vue'
import type { AttachmentsMessage } from '../../types/messages'
import PdfIcon from '../../icons/pdf_icon.svg'
import '../../styles/AttachmentsMessage.css'
import '../../styles/ImageMessage.css'

const props = defineProps<{
  message: AttachmentsMessage
}>()

const images = computed(() =>
  props.message.attachments.filter((a) => a.type === 'image'),
)
const videos = computed(() =>
  props.message.attachments.filter((a) => a.type === 'video'),
)
const files = computed(() =>
  props.message.attachments.filter((a) => a.type === 'file'),
)

const singleImage = computed(() => (images.value.length === 1 ? images.value[0] : null))
</script>

<template>
  <div class="attachments-message">
    <div v-if="videos.length" class="videos-section">
      <div
        v-for="video in videos"
        :key="video.id"
        class="video-message"
      >
        <div class="video-frame">
          <video
            :src="video.url"
            controls
            preload="metadata"
            class="video-player"
          />
        </div>
      </div>
    </div>
>
    <div v-if="singleImage && videos.length === 0" class="single-image">
      <div class="image-message">
        <div class="image-frame">
          <img :src="singleImage.url" alt="" loading="eager" />
        </div>
      </div>
    </div>

    <div v-else-if="images.length && videos.length === 0" class="mosaic" :data-count="images.length">
      <div
        v-for="img in images.slice(0, 4)"
        :key="img.id"
        class="mosaic-item"
      >
        <img :src="img.url" alt="" loading="eager" />
        <div
          v-if="images.length > 4 && img === images[3]"
          class="mosaic-more"
        >
          +{{ images.length - 4 }}
        </div>
      </div>
    </div>

    <div v-if="images.length && videos.length > 0" class="images-below-videos">
      <div v-if="images.length === 1" class="single-image">
        <div class="image-message">
          <div class="image-frame">
            <img :src="images[0].url" alt="" loading="eager" />
          </div>
        </div>
      </div>
      <div v-else class="mosaic" :data-count="images.length">
        <div
          v-for="img in images.slice(0, 4)"
          :key="img.id"
          class="mosaic-item"
        >
          <img :src="img.url" alt="" loading="eager" />
          <div
            v-if="images.length > 4 && img === images[3]"
            class="mosaic-more"
          >
            +{{ images.length - 4 }}
          </div>
        </div>
      </div>
    </div>

    <p v-if="message.caption" class="caption">
      {{ message.caption }}
    </p>

    <div v-if="files.length" class="files" :class="{ 'with-media': images.length > 0 || videos.length > 0 }">
      <div v-for="att in files" :key="att.id" class="attachment-tile file">
        <a class="attachment-file-body" :href="att.url" target="_blank" rel="noreferrer">
          <div class="attachment-file-icon">
            <img :src="PdfIcon" alt="" class="attachment-file-icon-img" />
          </div>
          <div class="attachment-file-text">
            <div class="attachment-file-name">
              {{ att.name }}
            </div>
            <div class="attachment-file-meta-row">
              <span class="attachment-file-meta-text">FILE</span>
              <span class="attachment-file-dot" aria-hidden="true"></span>
              <span class="attachment-file-meta-text">{{ att.sizeLabel }}</span>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>


