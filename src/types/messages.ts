export type MessageKind = string
export type MessageDirection = 'incoming' | 'outgoing'

export interface BaseMessage {
  id: string
  kind: MessageKind
  direction: MessageDirection
  createdAt: string
  read?: boolean
  unread?: boolean
}

export interface TextMessage extends BaseMessage {
  kind: 'text'
  text: string
}

export interface ImageMessage extends BaseMessage {
  kind: 'image'
  imageUrl: string
  caption?: string
}

export type AttachmentType = 'image' | 'file' | 'video'

export interface MessageAttachment {
  id: string
  type: AttachmentType
  name: string
  url: string
  sizeLabel?: string
}

export interface AttachmentsMessage extends BaseMessage {
  kind: 'attachments'
  attachments: MessageAttachment[]
  caption?: string
}

export interface VideoMessage extends BaseMessage {
  kind: 'video'
  videoUrl: string
  caption?: string
}

export type Message = TextMessage | ImageMessage | AttachmentsMessage | VideoMessage

export interface NewMessageInput {
  text?: string
  attachments?: MessageAttachment[]
}

