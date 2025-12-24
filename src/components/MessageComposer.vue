<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { MessageAttachment, NewMessageInput } from '../types/messages'
import PlusIcon from '../icons/Plus.svg'
import WhatsupIcon from '../icons/Whatsup.svg'
import PdfIcon from '../icons/pdf_icon.svg'

const emit = defineEmits<{
  send: [payload: NewMessageInput]
}>()

const text = ref('')
const attachments = ref<MessageAttachment[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const canSend = computed(
  () =>
    text.value.trim().length > 0 ||
    attachments.value.length > 0,
)

const resize = () => {
  const el = textareaRef.value
  if (!el) return

  const lineHeight = parseInt(getComputedStyle(el).lineHeight, 10) || 20
  const minHeight = lineHeight

  // Save current scroll position to prevent jumping
  const scrollTop = el.scrollTop

  // Reset height to auto to get accurate scrollHeight
  el.style.height = 'auto'
  
  // Get the natural height of the content
  const contentHeight = el.scrollHeight
  
  // Set height to content height, with minimum of one line
  // No maximum limit - let it grow naturally and push elements down
  el.style.height = `${Math.max(contentHeight, minHeight)}px`
  
  // Restore scroll position to keep textarea growing downward
  el.scrollTop = scrollTop
}

const resetFields = () => {
  text.value = ''
  attachments.value = []
  nextTick(resize)
}

const submit = () => {
  let cleanedText = text.value
    .trim()
    .replace(/\n{2,}/g, '\n'); 

  if (!cleanedText && attachments.value.length === 0) return;

  const payload: NewMessageInput = {
    text: cleanedText,
    attachments: attachments.value,
  };

  emit('send', payload);
  resetFields();
};


const handleAttachClick = () => {
  fileInputRef.value?.click()
}

const formatSizeLabel = (bytes: number) => {
  const mb = bytes / (1024 * 1024)
  return `${Math.round(mb * 10) / 10}Mb`
}

const handleFilesSelected = (event: Event) => {
  const target = event.target as HTMLInputElement | null
  const files = target?.files
  if (!files?.length) return

  Array.from(files).forEach((file) => {
    const id = crypto.randomUUID()
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => {
        attachments.value.push({
          id,
          type: 'image',
          name: file.name,
          url: String(reader.result),
        })
      }
      reader.readAsDataURL(file)
    } else if (file.type.startsWith('video/')) {
      attachments.value.push({
        id,
        type: 'video',
        name: file.name,
        url: URL.createObjectURL(file),
      })
    } else {
      attachments.value.push({
        id,
        type: 'file',
        name: file.name,
        sizeLabel: formatSizeLabel(file.size),
        url: URL.createObjectURL(file),
      })
    }
  })

  if (target) {
    target.value = ''
  }
}

const removeAttachment = (id: string) => {
  const item = attachments.value.find((att) => att.id === id)
  if ((item?.type === 'file' || item?.type === 'video') && item.url.startsWith('blob:')) {
    URL.revokeObjectURL(item.url)
  }
  attachments.value = attachments.value.filter((att) => att.id !== id)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    submit()
  }
}

watch(text, () => nextTick(resize))
onMounted(() => nextTick(resize))
</script>

<template>
  <form class="composer" @submit.prevent="submit">
    <div class="channel-bar">
      <div class="channel-info">
        <img :src="WhatsupIcon" alt="" class="channel-icon" />
        <span class="channel-text">WhatsApp (Forest hotel support WhatsApp)</span>
      </div>
      <span class="channel-tag">2h</span>
    </div>

    <div class="input-area">
      <div class="input-row">
        <textarea
          ref="textareaRef"
          v-model="text"
          class="input message-input"
          name="message-input"
          placeholder="Type your message here"
          rows="1"
          @keydown="handleKeydown"
        ></textarea>
      </div>

      <div v-if="attachments.length" class="attachments">
        <div
          v-for="att in attachments"
          :key="att.id"
          class="attachment-tile"
          :class="att.type"
        >
          <button
            type="button"
            class="attachment-close"
            aria-label="Remove attachment"
            @click="removeAttachment(att.id)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M7.2 7.2 12 12m0 0 4.8 4.8M12 12l4.8-4.8M12 12 7.2 16.8"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
          <template v-if="att.type === 'image'">
            <img :src="att.url" alt="" class="attachment-thumb" />
          </template>
          <template v-else-if="att.type === 'video'">
            <video :src="att.url" class="attachment-thumb" preload="metadata" />
          </template>
          <template v-else>
            <div class="attachment-file-body">
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
            </div>
          </template>
        </div>
      </div>

      <div class="footer-row">
        <div class="attach">
          <button
            class="icon-btn"
            type="button"
            aria-label="Add attachment"
            @click="handleAttachClick"
          >
            <img :src="PlusIcon" alt="" class="plus-icon" />
          </button>
          <input
            ref="fileInputRef"
            type="file"
            class="file-input"
            multiple
            @change="handleFilesSelected"
          />
        </div>
        <button type="submit" class="send" :disabled="!canSend">
          Send
        </button>
      </div>
    </div>
  </form>
</template>

<style>
@import '../styles/MessageComposer.css';
</style>

