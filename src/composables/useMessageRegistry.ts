import type { Component } from 'vue'
import type { MessageKind } from '../types/messages'

// Default message components
import TextMessage from '../components/messages/TextMessage.vue'
import ImageMessage from '../components/messages/ImageMessage.vue'
import AttachmentsMessage from '../components/messages/AttachmentsMessage.vue'
import VideoMessage from '../components/messages/VideoMessage.vue'

/**
 * Message Registry System
 *
 * This system allows for extensible message types. To add a new message type:
 *
 * 1. Create a new interface extending BaseMessage in types/messages.ts:
 *    export interface YourMessage extends BaseMessage {
 *      kind: 'your-type'
 *      // your specific properties
 *    }
 *
 * 2. Create a Vue component in components/messages/:
 *    <script setup lang="ts">
 *    import type { YourMessage } from '../../types/messages'
 *    defineProps<{ message: YourMessage }>()
 *    </script>
 *    <template>...</template>
 *
 * 3. Register the component in this file:
 *    import YourMessageComponent from '../components/messages/YourMessageComponent.vue'
 *    this.register('your-type', YourMessageComponent)
 *
 * 4. Add the new type to the Message union type in types/messages.ts
 *
 * Example usage in App.vue:
 * const { register } = useMessageRegistry()
 * register('custom', CustomMessageComponent)
 */

class MessageRegistry {
  private components: Record<string, Component> = {}

  constructor() {
    // Register default components
    this.register('text', TextMessage)
    this.register('image', ImageMessage)
    this.register('attachments', AttachmentsMessage)
    this.register('video', VideoMessage)
  }

  register(kind: string, component: Component): void {
    this.components[kind] = component
  }

  unregister(kind: string): void {
    delete this.components[kind]
  }

  get(kind: string): Component | undefined {
    return this.components[kind]
  }

  getAll(): Record<string, Component> {
    return { ...this.components }
  }

  has(kind: string): boolean {
    return kind in this.components
  }
}

// Global registry instance
const messageRegistry = new MessageRegistry()

export const useMessageRegistry = () => {
  return {
    register: (kind: MessageKind | string, component: Component) => {
      messageRegistry.register(kind, component)
    },
    unregister: (kind: string) => {
      messageRegistry.unregister(kind)
    },
    get: (kind: string) => messageRegistry.get(kind),
    getAll: () => messageRegistry.getAll(),
    has: (kind: string) => messageRegistry.has(kind),
  }
}

export default messageRegistry