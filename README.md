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


