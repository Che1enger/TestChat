<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import MessageComposer from './components/MessageComposer.vue'
import MessageList from './components/MessageList.vue'
import { generateMockMessages } from './mock/messages'
import type { Message, NewMessageInput } from './types/messages'
import SearchIcon from './icons/Search.svg'
import './styles/App.css'

// Debounce utility function for performance optimization
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Infinite scroll: load 20 messages per batch
const batchSize = 20
const scrollContainer = ref<HTMLElement | null>(null)
const allMessages = ref<Message[]>(generateMockMessages())
// Initially show only the last batch (20 messages)
const renderedCount = ref(Math.min(batchSize, allMessages.value.length))
// Mark the most recent message as "unread"
const unreadMarkerId = ref<string | null>(allMessages.value.at(-1)?.id ?? null)
// Track initial messages (loaded on start) - only these should have animation
const initialMessageIds = ref<Set<string>>(new Set())
const initialAutoScrollDone = ref(false)

// Initialize: mark all initially visible messages
const initialMessages = allMessages.value.slice(-renderedCount.value)
initialMessages.forEach(msg => initialMessageIds.value.add(msg.id))

// Show only the most recent messages (from the end of the array)
// As user scrolls up, we load older messages
const visibleMessages = computed(() => {
  const start = Math.max(allMessages.value.length - renderedCount.value, 0)
  return allMessages.value.slice(start)
})

// Check if there are more messages to load
const hasMore = computed(() => renderedCount.value < allMessages.value.length)
const unreadObserver = ref<IntersectionObserver | null>(null)
const isLoadingOlder = ref(false)

// Auto-scroll to bottom on initial load with smooth scrolling experience
const scrollToBottom = (options?: { initial?: boolean }) => {
  const el = scrollContainer.value
  if (!el) return

  if (options?.initial) {
    if (initialAutoScrollDone.value) return

    el.scrollTo({
      top: el.scrollHeight,
      behavior: 'smooth',
    })

    initialAutoScrollDone.value = true
    return
  }

  el.scrollTo({
    top: el.scrollHeight,
    behavior: 'smooth',
  })
}



// Mark message as read (currently not used in demo - last message stays unread)
// This function is kept for future implementation of auto-read functionality
// Usage: markMessageRead(messageId) - uncomment in setupUnreadObserver to enable
const markMessageRead = (id: string) => {
  const idx = allMessages.value.findIndex((m) => m.id === id)
  if (idx === -1) return
  const updated = [...allMessages.value]
  updated[idx] = { ...updated[idx], unread: false, read: true }
  allMessages.value = updated
  if (unreadMarkerId.value === id) {
    unreadMarkerId.value = null
  }
}

// Auto-read functionality (disabled for demo - last message stays unread)
// This observer marks messages as read when they come into view
// For demo purposes, auto-read is disabled to keep the last message as "unread"
const setupUnreadObserver = async () => {
  unreadObserver.value?.disconnect()
  unreadObserver.value = null

  const id = unreadMarkerId.value
  const root = scrollContainer.value
  if (!id || !root) return

  await nextTick()
  // Small delay to ensure the element is fully rendered
  await new Promise(resolve => setTimeout(resolve, 50))
  const target = root.querySelector<HTMLElement>(`[data-message-id="${id}"]`)
  if (!target) return

  unreadObserver.value = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (!entry) return
      if (entry.isIntersecting && entry.intersectionRatio >= 0.8) {

        // To enable auto-read functionality, uncomment the following lines:
        // markMessageRead(id)
        // unreadObserver.value?.disconnect()
        // unreadObserver.value = null
      }
      // Keep function reference for TypeScript (never executed in demo mode)
      if (false) markMessageRead('')
    },
    { root, threshold: 0.8 },
  )

  unreadObserver.value.observe(target)
}

// Infinite scroll: load 20 messages per batch when scrolling up
const loadOlder = async () => {
  if (!hasMore.value || isLoadingOlder.value) return
  const el = scrollContainer.value
  if (!el) return

  isLoadingOlder.value = true

  const previousHeight = el.scrollHeight
  const previousTop = el.scrollTop

  renderedCount.value = Math.min(
    renderedCount.value + batchSize,
    allMessages.value.length,
  )

  await nextTick()
  
  const newHeight = el.scrollHeight
  const heightDiff = newHeight - previousHeight
  const newScrollTop = previousTop + heightDiff
  
  el.scrollTo({
    top: newScrollTop,
    behavior: 'auto'
  })

  isLoadingOlder.value = false
}

// Debounced scroll handler for performance optimization
const handleScroll = debounce(() => {
  const el = scrollContainer.value
  if (!el) return

  if (!hasMore.value) return

  if (el.scrollTop <= 100 && !isLoadingOlder.value) {
    loadOlder()
  }
}, 100)

const appendMessage = async (message: Message) => {
  const normalized: Message = { ...message, unread: true, read: message.read ?? false }
  allMessages.value = allMessages.value.map((msg) => ({ ...msg, unread: false }))
  allMessages.value = [...allMessages.value, normalized]
  // Add new message to initial messages set so it has animation
  initialMessageIds.value.add(normalized.id)
  renderedCount.value = Math.min(
    Math.max(renderedCount.value, batchSize),
    allMessages.value.length,
  )
  unreadMarkerId.value = normalized.id
  await nextTick()
  scrollToBottom()
}

const handleSend = (payload: NewMessageInput) => {
  const trimmedText = payload.text?.trim() ?? ''
  const attachments = payload.attachments ?? []
  const hasAttachments = attachments.length > 0
  if (!trimmedText && !hasAttachments) return

  // Determine message type based on attachment count and type
  // Single image/video messages use dedicated message types for better rendering
  const onlyOneImage =
    attachments.length === 1 && attachments[0]?.type === 'image'
  const onlyOneVideo =
    attachments.length === 1 && attachments[0]?.type === 'video'

  // Create message object with appropriate type based on content
  // Priority: single image > single video > multiple attachments > text only
  const message: Message =
    hasAttachments && onlyOneImage
      ? {
          id: crypto.randomUUID(),
          kind: 'image',
          direction: 'outgoing',
          createdAt: new Date().toISOString(),
          read: false,
          unread: true,
          imageUrl: attachments[0]!.url,
          caption: trimmedText || undefined,
        }
      : hasAttachments && onlyOneVideo
        ? {
            id: crypto.randomUUID(),
            kind: 'video',
            direction: 'outgoing',
            createdAt: new Date().toISOString(),
            read: false,
            unread: true,
            videoUrl: attachments[0]!.url,
            caption: trimmedText || undefined,
          }
        : hasAttachments
        ? {
            id: crypto.randomUUID(),
            kind: 'attachments',
            direction: 'outgoing',
            createdAt: new Date().toISOString(),
            read: false,
            unread: true,
            caption: trimmedText || undefined,
            attachments,
          }
        : {
            id: crypto.randomUUID(),
            kind: 'text',
            direction: 'outgoing',
            createdAt: new Date().toISOString(),
            read: false,
            unread: true,
            text: trimmedText,
          }

  appendMessage(message)
}

onMounted(() => {
  nextTick(() => {
    scrollToBottom({ initial: true })
  })

  setupUnreadObserver()
})


watch(unreadMarkerId, () => {
  setupUnreadObserver()
})

watch(visibleMessages, () => {
  setupUnreadObserver()
})

onUnmounted(() => {
  unreadObserver.value?.disconnect()
})
</script>

<template>
  <main class="page">
    <div class="frame">
      <section class="chat-card">
        <header class="chat-header">
          <div class="title">Alice Green</div>
          <button class="icon-btn" type="button" aria-label="Search">
            <img :src="SearchIcon" alt="" class="search-icon" />
          </button>
        </header>

        <div
          class="messages-panel"
          ref="scrollContainer"
          @scroll.passive="handleScroll"
        >
          <MessageList
            :messages="visibleMessages"
            :unread-marker-id="unreadMarkerId"
            :initial-message-ids="initialMessageIds"
          />
        </div>

        <MessageComposer @send="handleSend" />
      </section>
    </div>
  </main>
</template>

