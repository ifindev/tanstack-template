# Application Architecture: ViewModel Pattern

This guide documents the architectural pattern used throughout this project to maintain clean separation of concerns and deterministic data flow.

## The Three-Layer Model

The architecture consists of three distinct layers, each with clear responsibilities:

```
Route File (View)
  └─ ViewModel Hook
      └─ Sub-hooks & Components
```

### Layer 1: Route Files (Views)

Route files render the page and nothing else. They:
- Render the page structure (`<main>`, layout containers)
- Call **one** ViewModel hook and nothing else
- Pass values from the ViewModel to child components via explicit named props
- Contain zero logic, state, or hooks besides the ViewModel call

**File location:** `src/routes/[path]/(view-name)/[route-file].tsx`

**Example:**
```tsx
export const Route = createFileRoute("/_authed/chat/new")({
  component: NewConversationPage,
});

function NewConversationPage() {
  const vm = useNewConversationViewModel();
  return (
    <main>
      <ConversationPanel
        bottomRef={vm.chatSession.bottomRef}
        messages={vm.chatSession.messages}
        // ... all props named explicitly, never use spread
      />
    </main>
  );
}
```

### Layer 2: ViewModel Hooks

ViewModel hooks orchestrate all page logic. They:
- Own all hooks: `Route.useParams()`, `useNavigate()`, `trpc.*`, `useMemo`, `useState`
- Call sub-hooks and store results in variables (e.g., `const chatSession = useChatSession(...)`)
- Build handlers in the hook body (e.g., `const handleClick = () => { ... }`)
- Return a flat object literal containing only named references to already-resolved values
- **Never** do computation or construction inside the return literal

**File location:** `src/routes/[path]/(view-name)/-[route-name].view-model.ts`

**Naming convention:**
- `-new.view-model.ts` for a route file `new.tsx`
- `-login.view-model.ts` for a route file `login.tsx`
- `-chat.view-model.ts` for a route file `index.tsx` (named after the URL segment, not the filename)

The `-` prefix is required: TanStack Router scans all files in `src/routes/` and warns about any file that doesn't export a `Route`. Prefixing with `-` uses the router's `routeFileIgnorePrefix` setting to exclude non-route files silently.

**Example:**
```ts
export function useNewConversationViewModel() {
  const navigate = useNavigate();
  const createdIdRef = useRef<string | null>(null);

  // Build handlers in the body
  const handleConversationCreated = (id: string) => {
    createdIdRef.current = id;
  };

  const handleChatFinished = () => {
    if (createdIdRef.current) {
      navigate({
        to: "/chat/$conversationId",
        params: { conversationId: createdIdRef.current },
      });
    }
  };

  // Call sub-hooks and store the result
  const chatSession = useChatSession({
    chatId: "draft-chat",
    isConversationLoading: false,
    onConversationCreated: handleConversationCreated,
    onChatFinished: handleChatFinished,
  });

  // Return a flat object of named references
  return {
    chatSession,
  };
}
```

### Layer 3: Components

Components are pure renderers. They:
- Accept all data and handlers via props
- Contain no hooks except internal UI state (e.g., a timer's running state, a popover's open/closed state)
- Render a focused piece of UI
- **Never** render page-level structure (`<main>`, full-page layouts)
- **Never** call hooks for data fetching or state management

**File location:** `src/components/[feature]/[component].tsx`

**Example:**
```tsx
type ComposerAreaProps = {
  input: string;
  onInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
  // ... all props explicit, no spread
};

export default function ComposerArea({
  input,
  onInputChange,
  onSubmit,
  // ...
}: ComposerAreaProps) {
  return (
    <div>
      <Textarea
        value={input}
        onChange={onInputChange}
        // ...
      />
      <Button onClick={onSubmit}>Send</Button>
    </div>
  );
}
```

## Sub-Hooks

Sub-hooks are single-concern hooks that handle one specific responsibility. They are called by ViewModel hooks.

**File location:** `src/hooks/use-[concern].ts`

**Naming:** `use<Concern>` following React hook conventions.

**Example:**
```ts
// src/hooks/use-chat-scroll.ts
export function useChatScroll() {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    // scroll tracking logic
  }, []);

  return { bottomRef, isAtBottom, scrollToBottom };
}
```

Sub-hooks can be composed by ViewModel hooks:

```ts
// src/routes/_authed/chat/(new)/-new.view-model.ts
export function useNewConversationViewModel() {
  const chatSession = useChatSession({
    // useChatSession internally uses useChatScroll
  });
  return { chatSession };
}
```

## Data Flow

Data flows deterministically from the ViewModel down to components:

```
ViewModel (owns all state and logic)
  ↓ returns object with named properties
Route View (destructures and passes named props)
  ↓ passes vm.something to:
Component (receives as props, renders)
```

For example, a chat session:

```
useChatSessionViewModel()
  ├─ calls useChatSession()
  │   ├─ calls useChatScroll()
  │   ├─ calls useChat()
  │   ├─ calls trpc.config.features.useQuery()
  │   └─ returns { messages, input, bottomRef, onSubmit, ... }
  └─ returns { chatSession }

NewConversationPage View
  ├─ receives { chatSession } from ViewModel
  ├─ passes vm.chatSession.messages to:
  │   └─ ConversationPanel (pure component)
  └─ passes vm.chatSession.onSubmit to:
      └─ ComposerArea (pure component)
```

## Rules and Anti-Patterns

### Do ✓

- Define handlers in the ViewModel body before the return
- Return a flat object from the ViewModel: `return { chatSession }`
- Pass all props explicitly to components: `message={vm.chatSession.message}`
- Call hooks only in ViewModels or components that manage internal UI state
- Use `(view-name)` directories to co-locate Views and ViewModels

### Don't ✗

- Put logic in route files (no `useState`, `useEffect`, `trpc.*` in Views)
- Put hooks in component files for data fetching (data fetching belongs in ViewModel)
- Use spread props: `<ComposerArea {...vm} />` obscures what props flow where
- Do computation or construction inside the ViewModel's return:
  ```ts
  // Wrong:
  return { onSubmit: () => doThing() }

  // Right:
  const handleSubmit = () => doThing()
  return { onSubmit: handleSubmit }
  ```
- Render `<main>` or page-level structure inside a component (only Views render page structure)
- Create hooks inside `src/components/` directories (hooks live in ViewModels or `src/hooks/`)

## File Structure Example

```
src/
  hooks/
    use-chat-scroll.ts          ← Single-concern sub-hook
    use-chat-session.ts         ← Shared ViewModel logic composed by page ViewModels
  routes/
    _authed/
      chat/
        (new)/
          new.tsx                 ← View: route to /chat/new
          -new.view-model.ts       ← ViewModel: owns all logic for /chat/new
        (conversation)/
          $conversationId.tsx      ← View: route to /chat/:conversationId
          -$conversationId.view-model.ts  ← ViewModel: owns params, queries, composition
        (list)/
          index.tsx               ← View: route to /chat
          -chat.view-model.ts      ← ViewModel: owns queries, filtering, navigation
      (profile)/
        profile.tsx              ← View
        -profile.view-model.ts    ← ViewModel
    (auth)/
      (login)/
        login.tsx                ← View
        -login.view-model.ts      ← ViewModel
      (register)/
        register.tsx             ← View
        -register.view-model.ts   ← ViewModel
  components/
    chat/
      conversation-panel.tsx     ← Pure component
      composer-area.tsx          ← Pure component
      message-markdown.tsx       ← Pure component
    layout/
      editorial.tsx
      auth-shell.tsx
    ui/
      button.tsx
      ...
```

## Benefits of This Architecture

1. **Deterministic data flow:** Every value traces a single path. Finding where something comes from is trivial.
2. **Isolated testability:** ViewModel hooks can be tested with `renderHook` independent of UI. Views can be snapshot-tested with mock props.
3. **Clear responsibility boundaries:** Views render, ViewModels orchestrate, Components display. No ambiguity.
4. **Consistency:** Every page follows the same pattern. New developers immediately know where to put logic.
5. **Debugging:** When something breaks, you check two surfaces: is the ViewModel returning wrong data, or is the View/Component rendering it wrong?
6. **Reusability:** Sub-hooks like `useChatScroll` can be composed into multiple ViewModels.
