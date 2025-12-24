# Message System Architecture

## Overview

The message system is designed to be highly extensible, allowing for easy addition of new message types without modifying existing code. It follows the Open/Closed Principle and uses a registry pattern for component management.

## Core Features

✅ **Infinite Scroll**: Loads 20 messages per batch when scrolling up
✅ **Date Dividers**: Shows date separators between messages from different days
✅ **Auto-scroll to Bottom**: Automatically scrolls to bottom on initial load
✅ **Unread Markers**: Marks the most recent message as unread
✅ **Smooth Scrolling**: Smooth scroll behavior throughout the interface
✅ **Message Types**: Extensible system for different message types
✅ **Timestamps**: Shows creation time for all messages
✅ **Read Receipts**: Green checkmarks for outgoing messages only

## Architecture

### Message Types

All message types extend the `BaseMessage` interface:

```typescript
interface BaseMessage {
  id: string
  kind: MessageKind
  direction: MessageDirection
  createdAt: string
  read?: boolean
  unread?: boolean
}
```

### Component Registry

The system uses a centralized registry (`useMessageRegistry`) that maps message kinds to Vue components. This allows for runtime registration of new message types.

### Adding New Message Types

To add a new message type:

1. **Create Type Definition** (`src/types/messages.ts`):
```typescript
export interface VideoMessage extends BaseMessage {
  kind: 'video'
  videoUrl: string
  caption?: string
}
```

2. **Create Component** (`src/components/messages/VideoMessage.vue`):
```vue
<script setup lang="ts">
import type { VideoMessage } from '../../types/messages'
defineProps<{ message: VideoMessage }>()
</script>

<template>
  <div class="video-message">
    <video :src="message.videoUrl" controls />
    <p v-if="message.caption">{{ message.caption }}</p>
  </div>
</template>
```

3. **Register Component** (`src/composables/useMessageRegistry.ts`):
```typescript
import VideoMessage from '../components/messages/VideoMessage.vue'

// In constructor or via useMessageRegistry()
this.register('video', VideoMessage)
```

4. **Update Union Type**:
```typescript
export type Message = TextMessage | ImageMessage | AttachmentsMessage | VideoMessage
```

### Runtime Registration

You can also register components at runtime:

```typescript
import { useMessageRegistry } from './composables/useMessageRegistry'

const { register } = useMessageRegistry()
register('custom', CustomMessageComponent)
```

## Existing Message Types

- **Text Message**: Plain text messages
- **Image Message**: Images with optional captions and lazy loading
- **Attachments Message**: Multiple files/images with captions
- **Video Message**: Video files with controls (example implementation)

## Benefits

- **Extensible**: Easy to add new message types
- **Maintainable**: Clear separation of concerns
- **Type Safe**: Full TypeScript support
- **Performance**: Lazy loading for images
- **User Experience**: Smooth scrolling and infinite scroll
