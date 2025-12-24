import { faker } from '@faker-js/faker'
import type {
  ImageMessage,
  Message,
  MessageDirection,
  TextMessage,
} from '../types/messages'

faker.seed(7)

// Start from 5 days ago
const startDate = new Date()
startDate.setDate(startDate.getDate() - 5)
startDate.setHours(9, 0, 0, 0) // Start at 9 AM

const createImageUrl = () =>
  `https://picsum.photos/seed/${faker.string.uuid()}/900/640`

const realisticTexts = [
  'Hello! How can I help you today?',
  'Thank you for contacting us.',
  'I understand your concern.',
  'Let me check that for you.',
  'That sounds great!',
  'I appreciate your patience.',
  'Is there anything else I can help with?',
  'Perfect! I\'ve noted that down.',
  'I\'ll get back to you shortly.',
  'Have a wonderful day!',
  'Could you provide more details?',
  'I\'ll forward this to our team.',
  'Thanks for the update!',
  'That makes sense.',
  'I\'m here to assist you.',
  'Let me know if you need anything else.',
  'I\'ll look into this right away.',
  'Thanks for your understanding.',
  'I hope this helps!',
  'Feel free to reach out anytime.',
]

const buildText = (index: number): string => {
  // Mix realistic texts with faker for variety
  if (index % 3 === 0 && index < realisticTexts.length * 3) {
    return realisticTexts[index % realisticTexts.length]
  }
  return faker.lorem.sentences(faker.number.int({ min: 1, max: 3 }))
}

const buildCaption = (): string => {
  const captions = [
    'Check this out!',
    'Here\'s what I was talking about',
    'Thought you might like this',
    'Look at this!',
    'This is interesting',
    'What do you think?',
    'Pretty cool, right?',
  ]
  return faker.helpers.arrayElement(captions)
}

// Simulate realistic conversation flow
const getNextDirection = (
  currentDirection: MessageDirection,
  messageIndex: number,
): MessageDirection => {
  // Start with incoming message
  if (messageIndex === 0) return 'incoming'

  // Simulate conversation patterns:
  // - Usually alternate between messages
  // - Sometimes have 2-3 messages in a row from same person
  // - More likely to alternate in active conversations

  const shouldAlternate = faker.number.float({ min: 0, max: 1 }) > 0.3
  if (shouldAlternate) {
    return currentDirection === 'incoming' ? 'outgoing' : 'incoming'
  }

  // 30% chance to continue from same direction (realistic conversation flow)
  return currentDirection
}

// Generate timestamp with realistic gaps
const generateTimestamp = (
  baseDate: Date,
  messageIndex: number,
  previousTimestamp?: Date,
): Date => {
  const date = previousTimestamp ? new Date(previousTimestamp) : new Date(baseDate)

  // Simulate realistic message timing:
  // - Quick replies: 1-5 minutes
  // - Normal replies: 5-30 minutes
  // - Longer gaps: 30 minutes - 2 hours (simulating breaks)
  // - Overnight gaps: 8-12 hours

  let minutesToAdd = 0

  if (messageIndex === 0) {
    // First message at start time
    return date
  }

  // Determine gap based on conversation flow
  const gapType = faker.number.float({ min: 0, max: 1 })

  if (gapType < 0.4) {
    // Quick reply: 1-5 minutes
    minutesToAdd = faker.number.int({ min: 1, max: 5 })
  } else if (gapType < 0.75) {
    // Normal reply: 5-30 minutes
    minutesToAdd = faker.number.int({ min: 5, max: 30 })
  } else if (gapType < 0.9) {
    // Longer gap: 30 minutes - 2 hours
    minutesToAdd = faker.number.int({ min: 30, max: 120 })
  } else {
    // Overnight/long gap: 8-12 hours (simulating sleep/work)
    minutesToAdd = faker.number.int({ min: 480, max: 720 })
  }

  date.setMinutes(date.getMinutes() + minutesToAdd)

  // Ensure we don't go beyond current time
  const now = new Date()
  if (date > now) {
    return now
  }

  return date
}

export const generateMockMessages = (): Message[] => {
  const messages: Message[] = []
  const totalMessages = 65 // 3 batches of 20+ messages
  let currentDirection: MessageDirection = 'incoming'
  let currentDate = new Date(startDate)
  let previousTimestamp: Date | undefined

  for (let i = 0; i < totalMessages; i += 1) {
    // Get next direction based on conversation flow
    currentDirection = getNextDirection(currentDirection, i)

    // Generate timestamp
    previousTimestamp = generateTimestamp(startDate, i, previousTimestamp)
    currentDate = previousTimestamp
    const createdAt = currentDate.toISOString()

    // Determine message type (70% text, 30% image) - no file attachments
    const messageType = faker.number.float({ min: 0, max: 1 })
    const isRead = currentDirection === 'incoming' || faker.number.float() > 0.3

    if (messageType < 0.7) {
      // Text message (70%)
      const textMessage: TextMessage = {
        id: faker.string.uuid(),
        kind: 'text',
        direction: currentDirection,
        createdAt,
        read: isRead,
        unread: false,
        text: buildText(i),
      }
      messages.push(textMessage)
    } else {
      // Image message (30%)
      const imageMessage: ImageMessage = {
        id: faker.string.uuid(),
        kind: 'image',
        direction: currentDirection,
        createdAt,
        read: isRead,
        unread: false,
        imageUrl: createImageUrl(),
        caption: faker.number.float() > 0.6 ? buildCaption() : undefined,
      }
      messages.push(imageMessage)
    }
  }

  // Sort by timestamp (should already be in order, but ensure it)
  const ordered = messages.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  // Mark the last message as unread
  const last = ordered.at(-1)
  if (last) {
    last.unread = true
    last.read = false
  }

  return ordered
}

