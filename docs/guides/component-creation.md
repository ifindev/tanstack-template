# Component Creation Guide

## Directory Map

```
src/components/
  ui/          shadcn/ui primitives — do not modify these files
  layout/      App-wide layout components (Navbar, sidebar shells, page containers)
  <feature>/   Feature-specific components (e.g., chat/, dashboard/)
```

Always place components under `src/components/`. Never define a reusable component inside `src/routes/` — routes are for pages only.

## Choosing a Subdirectory

| Where | When |
|-------|------|
| `ui/` | Only for shadcn/ui primitives added via the shadcn CLI. Do not create files here manually. |
| `layout/` | App-wide structural components shared across multiple features (Navbar, auth shell, editorial wrapper). |
| `<feature>/` | Components scoped to one feature (e.g., `chat/conversation-panel.tsx`). Create a new subdirectory when a feature has more than one component. |

## File Conventions

**One component per file.** Each file's primary export is a single React component.

**Default export.** The component must be the default export:

```tsx
// correct
export default function ConversationPanel({ ... }: ConversationPanelProps) {
  return ...;
}

// wrong — named export for the component
export function ConversationPanel(...) { ... }

// wrong — arrow function
const ConversationPanel = (...) => ...;
export default ConversationPanel;
```

**Function declaration, not arrow function.** Use `function` syntax for the exported component. Inner helper components and utility functions within the same file may use either style.

**Named exports for types and utilities** in the same file are fine:

```tsx
export type ConversationUiMessage = ChatUiMessage;

export function getMessageText(msg: ConversationUiMessage): string { ... }

export default function ConversationPanel(...) { ... }
```

## Example: Correct Structure

```
src/components/chat/
  chat-session.tsx          // export default function ChatSession
  conversation-panel.tsx    // export default function ConversationPanel
  conversation-panel.test.tsx
  message-markdown.tsx      // export default function MessageMarkdown
  message-markdown.test.tsx
```

Consuming route:

```tsx
// src/routes/_authed/chat/new.tsx
import ChatSession from "@/components/chat/chat-session";
```

## What Does NOT Belong in src/routes/

Route files (`src/routes/**/*.tsx`) should contain only:

- The `Route` constant exported via `createFileRoute`
- The single page component that the route renders (the `component` option)

Any UI building block used by more than one route, or that is logically a reusable piece of UI, belongs in `src/components/<feature>/`.
