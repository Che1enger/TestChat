<script setup lang="ts">
import type { Message } from '../types/messages'
import { useMessageRegistry } from '../composables/useMessageRegistry'
import CheckIcon from '../icons/Galochka.svg'
import '../styles/MessageList.css'

const isOnlyFiles = (message: Message) =>
  message.kind === 'attachments' &&
  message.attachments.length > 0 &&
  message.attachments.every((a) => a.type === 'file')

const props = defineProps<{
  messages: Message[]
  unreadMarkerId: string | null
  initialMessageIds?: Set<string>
}>()

const { getAll } = useMessageRegistry()
const registry = getAll()

// Memoization cache for performance optimization
const dayLabelCache = new Map<string, string>()
const timeCache = new Map<string, string>()

const formatDayLabel = (iso: string) => {
  if (dayLabelCache.has(iso)) {
    return dayLabelCache.get(iso)!
  }
  const date = new Date(iso)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const result = `${day}/${month}/${year}`
  dayLabelCache.set(iso, result)
  return result
}

const formatTime = (iso: string) => {
  if (timeCache.has(iso)) {
    return timeCache.get(iso)!
  }
  const result = new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso))
  timeCache.set(iso, result)
  return result
}

// Date dividers between messages from different days
const shouldShowDivider = (index: number) => {
  if (index === 0) return true
  const current = props.messages[index]
  const previous = props.messages[index - 1]
  const currentDate = new Date(current.createdAt)
  const previousDate = new Date(previous.createdAt)
  return currentDate.toDateString() !== previousDate.toDateString()
}


const wasLoadedOnScroll = (messageId: string) => {
  if (!props.initialMessageIds) return true
  return !props.initialMessageIds.has(messageId)
}

</script>

<template>
  <div class="message-list">
    <template v-for="(message, index) in messages" :key="message.id">
      <div v-if="shouldShowDivider(index)" class="date-divider">
        <span>{{ formatDayLabel(message.createdAt) }}</span>
      </div>

      <div
        v-if="props.unreadMarkerId && props.unreadMarkerId === message.id"
        class="unread-marker"
      >
        <span>New</span>
      </div>

      <div 
        class="message-row" 
        :class="[message.direction, { 'no-animation': wasLoadedOnScroll(message.id) }]"
      >
        <div
          class="message-container"
          :class="message.direction"
          :data-message-id="message.id"
          :data-only-files="isOnlyFiles(message) ? 'true' : 'false'"
        >
          <div class="bubble-content" :class="message.direction">
            <component :is="registry[message.kind]" :message="message" />
          </div>
          <div class="meta-footer">
            <div class="meta">
              <span
                v-if="message.direction === 'outgoing'"
                class="receipt"
                :aria-label="message.read ? 'Read' : 'Sent'"
                :data-read="message.read"
              >
                <img :src="CheckIcon" alt="" class="receipt-icon" />
              </span>
              <span class="channel">WhatsApp</span>
              <span class="dot"></span>
              <span class="time">{{ formatTime(message.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
    <div class="message-list-spacer"></div>
  </div>
</template>

