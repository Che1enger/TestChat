# Chat Application

A modern, responsive chat application built with Vue 3 and TypeScript. Features infinite scroll, message composition with file attachments, and an extensible message type system.

## Features

- **Infinite Scroll**: Load messages in batches of 20 for optimal performance
- **Message Types**: Support for text, images, videos, and file attachments
- **Message Composition**: Auto-resizing textarea with file attachment support
- **Date Dividers**: Visual separators between messages from different days
- **Read Receipts**: Delivery status indicators for outgoing messages
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Extensible Architecture**: Easy to add new message types without modifying existing code

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next-generation frontend tooling
- **@faker-js/faker** - Mock data generation

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Che1enger/TestChat.git
cd testtask
```

2. Install dependencies:
```bash
npm install
```

## Running Locally

### Development Mode

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in the terminal).

### Build for Production

Build the application for production:
```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

### Type Checking

Run TypeScript type checking:
```bash
npm run type-check
```

## Project Structure

```
src/
├── components/
│   ├── MessageComposer.vue      # Message input and attachment UI
│   ├── MessageList.vue          # Message list with infinite scroll
│   └── messages/
│       ├── TextMessage.vue      # Text message component
│       ├── ImageMessage.vue     # Image message component
│       ├── VideoMessage.vue     # Video message component
│       └── AttachmentsMessage.vue # Multiple attachments component
├── composables/
│   └── useMessageRegistry.ts    # Extensible message type registry
├── mock/
│   └── messages.ts              # Mock data generation
├── styles/
│   ├── base.css                 # Global styles and reset
│   ├── App.css                  # App component styles
│   ├── MessageList.css          # Message list styles
│   ├── MessageComposer.css      # Composer styles
│   └── [Component].css          # Individual component styles
├── types/
│   └── messages.ts              # TypeScript type definitions
├── icons/                       # SVG icons
├── App.vue                      # Main application component
└── main.ts                      # Application entry point
```

## Key Features Explained

### Infinite Scroll
Messages are loaded in batches of 20. When scrolling up, older messages are automatically loaded while preserving scroll position.

### Extensible Message Types
The application uses a registry pattern for message types. To add a new message type:
1. Create a new interface extending `BaseMessage` in `types/messages.ts`
2. Create a Vue component in `components/messages/`
3. Register it in `composables/useMessageRegistry.ts`
4. No changes needed to existing code

### Message Composition
- Auto-resizing textarea that grows with content
- Support for multiple file attachments (images, videos, files)
- Enter to send, Shift+Enter for new line
- Validation prevents sending empty messages

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

- Mock data is generated using `@faker-js/faker` with a fixed seed for consistency
- The application generates 65 messages spanning 5 days for testing
- Styles are organized by component in the `styles/` directory
- All components use TypeScript for type safety

## Architecture Decisions

Key architectural decisions made during implementation, organized by requirements.

### 1. Messages List

#### 1.1 Infinite Scroll (Load 20 Messages per Batch)

**Key Decisions:**
- **Scroll position preservation**: Saves `previousHeight` and `previousTop` before loading, calculates height difference after DOM update, restores position using `behavior: 'auto'` to prevent visual jumps.
- **Debounced scroll handler**: 100ms debounce prevents excessive function calls during rapid scrolling.
- **Reverse rendering**: Renders from end of array (most recent first) while maintaining chronological storage.

#### 1.2 Date Dividers

**Key Decisions:**
- **Memoization**: `Map`-based caching (`dayLabelCache`, `timeCache`) for date/time formatting to avoid redundant calculations during Vue re-renders.
- **Date comparison**: Uses `toDateString()` for accurate day comparison regardless of time.

#### 1.3 Unread Marker

**Key Decisions:**
- **IntersectionObserver infrastructure**: Prepared for auto-read functionality (currently disabled for demo).
- **Single marker**: Only one message marked as unread at a time, representing the "new messages" boundary.

### 2. Message Components

#### 2.1 Extensible Message Type System

**Key Decisions:**
- **Registry Pattern**: Centralized `useMessageRegistry` composable maps message `kind` to Vue components. Adding new types requires:
  1. Create interface extending `BaseMessage`
  2. Create component
  3. Register in registry
  4. No changes to existing code
- **Type Safety**: TypeScript union types (`Message = TextMessage | ImageMessage | ...`) ensure compile-time safety.
- **Dynamic Rendering**: Uses Vue's `<component :is>` with registry lookup.

#### 2.2 Image Message Component

**Key Decisions:**
- **Cache detection**: Checks `imgRef.complete && naturalHeight !== 0` to avoid showing skeleton for cached images.
- **Loading state**: Tracks `isLoaded` and `hasError` refs for skeleton/error UI.

### 3. Message Composition Area

#### 3.1 Auto-resizing Textarea

**Key Decisions:**
- **Scroll position preservation**: Saves `scrollTop` before resize, restores after to prevent cursor jumping.
- **Height calculation**: Resets to `auto`, then sets to `scrollHeight` for accurate content height.
- **No maximum limit**: Allows unlimited growth (design decision, differs from requirement of 10 lines).

#### 3.2 File Attachment Functionality

**Key Decisions:**
- **Different handling by type**: Images use `FileReader` (base64) for immediate preview; videos/files use `URL.createObjectURL` (blob URLs) for performance.
- **Memory management**: Revokes blob URLs on attachment removal to prevent memory leaks.

### 4. Mock Data

#### 4.1 Generation Strategy

**Key Decisions:**
- **Fixed seed**: `faker.seed(7)` ensures consistent mock data across runs for debugging.
- **65 messages**: More than required 60 to ensure proper batch testing (3+ batches of 20).

#### 4.2 Message Distribution

**Key Decisions:**
- **70/30 split**: Text (70%) vs image (30%) messages.
- **Seeded image URLs**: `picsum.photos` with seed ensures consistent images across runs.

### Additional Architectural Decisions

#### Performance Optimizations

- **Debounced scroll handler**: 100ms debounce prevents excessive calls during scrolling
- **Memoization**: `Map`-based caching for date/time formatting (`dayLabelCache`, `timeCache`)
- **Animation control**: Messages loaded on scroll use `no-animation` class to prevent performance issues
- **Computed properties**: Used for derived state (`visibleMessages`, `canSend`) for efficient reactivity

#### Extensibility

- **Registry pattern**: Adding new message types requires no changes to existing code
- **BaseMessage interface**: All message types extend `BaseMessage` for consistency
- **TypeScript union types**: Ensure compile-time type safety while allowing extensibility


