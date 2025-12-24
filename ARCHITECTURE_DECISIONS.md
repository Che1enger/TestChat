# Architecture Decisions

Key architectural decisions made during implementation, organized by requirements.

## 1. Messages List

### 1.1 Infinite Scroll (Load 20 Messages per Batch)

**Key Decisions:**
- **Scroll position preservation**: Saves `previousHeight` and `previousTop` before loading, calculates height difference after DOM update, restores position using `behavior: 'auto'` to prevent visual jumps.
- **Debounced scroll handler**: 100ms debounce prevents excessive function calls during rapid scrolling.
- **Reverse rendering**: Renders from end of array (most recent first) while maintaining chronological storage.

### 1.2 Date Dividers

**Key Decisions:**
- **Memoization**: `Map`-based caching (`dayLabelCache`, `timeCache`) for date/time formatting to avoid redundant calculations during Vue re-renders.
- **Date comparison**: Uses `toDateString()` for accurate day comparison regardless of time.

### 1.3 Auto-scroll to Bottom

**Key Decisions:**
- **One-time execution**: `initialAutoScrollDone` flag prevents multiple auto-scrolls during component lifecycle.
- **Separate initial vs. regular**: Function distinguishes between initial load (`behavior: 'smooth'`) and programmatic scrolls (`behavior: 'auto'`).

### 1.4 Unread Marker

**Key Decisions:**
- **IntersectionObserver infrastructure**: Prepared for auto-read functionality (currently disabled for demo).
- **Single marker**: Only one message marked as unread at a time, representing the "new messages" boundary.

## 2. Message Components

### 2.1 Extensible Message Type System

**Key Decisions:**
- **Registry Pattern**: Centralized `useMessageRegistry` composable maps message `kind` to Vue components. Adding new types requires:
  1. Create interface extending `BaseMessage`
  2. Create component
  3. Register in registry
  4. No changes to existing code
- **Type Safety**: TypeScript union types (`Message = TextMessage | ImageMessage | ...`) ensure compile-time safety.
- **Dynamic Rendering**: Uses Vue's `<component :is>` with registry lookup.

### 2.2 Image Message Component

**Key Decisions:**
- **Cache detection**: Checks `imgRef.complete && naturalHeight !== 0` to avoid showing skeleton for cached images.
- **Loading state**: Tracks `isLoaded` and `hasError` refs for skeleton/error UI.

## 3. Message Composition Area

### 3.1 Auto-resizing Textarea

**Key Decisions:**
- **Scroll position preservation**: Saves `scrollTop` before resize, restores after to prevent cursor jumping.
- **Height calculation**: Resets to `auto`, then sets to `scrollHeight` for accurate content height.
- **No maximum limit**: Allows unlimited growth (design decision, differs from requirement of 10 lines).

### 3.2 File Attachment Functionality

**Key Decisions:**
- **Different handling by type**: Images use `FileReader` (base64) for immediate preview; videos/files use `URL.createObjectURL` (blob URLs) for performance.
- **Memory management**: Revokes blob URLs on attachment removal to prevent memory leaks.

## 4. Mock Data

### 4.1 Generation Strategy

**Key Decisions:**
- **Fixed seed**: `faker.seed(7)` ensures consistent mock data across runs for debugging.
- **65 messages**: More than required 60 to ensure proper batch testing (3+ batches of 20).

### 4.2 Conversation Flow

**Key Decisions:**
- **Direction alternation**: 70% chance to alternate, 30% to continue same direction (simulates message chains).
- **Realistic timing gaps**: 
  - Quick replies: 1-5 min (40%)
  - Normal: 5-30 min (35%)
  - Longer: 30 min - 2h (15%)
  - Overnight: 8-12h (10%)
- **Chronological sorting**: Final sort by timestamp ensures correct order regardless of generation order.

### 4.3 Message Distribution

**Key Decisions:**
- **70/30 split**: Text (70%) vs image (30%) messages.
- **Seeded image URLs**: `picsum.photos` with seed ensures consistent images across runs.

## Additional Architectural Decisions

### Performance Optimizations

- **Debounced scroll handler**: 100ms debounce prevents excessive calls during scrolling
- **Memoization**: `Map`-based caching for date/time formatting (`dayLabelCache`, `timeCache`)
- **Animation control**: Messages loaded on scroll use `no-animation` class to prevent performance issues
- **Computed properties**: Used for derived state (`visibleMessages`, `canSend`) for efficient reactivity

### Extensibility

- **Registry pattern**: Adding new message types requires no changes to existing code
- **BaseMessage interface**: All message types extend `BaseMessage` for consistency
- **TypeScript union types**: Ensure compile-time type safety while allowing extensibility

