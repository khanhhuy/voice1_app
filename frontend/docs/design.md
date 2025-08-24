# Voice 1 - Development Documentation

This file provides comprehensive guidance for developing Voice 1, a Vue 3 frontend application.

## Quick Start

- `pnpm dev` - Start development server on port 3009 with VITE_ENV=dev

## Architecture Overview

Voice 1 is a Vue 3 frontend application built with modern tooling:

- **Vue 3 + TypeScript**: Core framework with strict type checking and composition API
- **Vite**: Build tool with base path set to `/app/`
- **Vue Router**: Routing handled through router-view in App.vue
- **Tailwind CSS v4**: Utility-first CSS framework with dark mode support via selector
- **Shadcn/Vue**: Component library for consistent UI components
- **State Management**: Custom injection-based state using `@vueuse/core` (no Pinia/Vuex)

## Project Structure

```
src/
├── app.ts              # Entry point
├── router.ts           # App router configuration
├── App.vue             # Root component
├── types.ts            # Global type definitions
├── components/         # UI components (mostly shadcn-vue)
│   └── ui/             # shadcn-vue components
│       └── index.ts    # Auto-generated component exports
├── lib/                # Utility functions
├── services/           # Utility services
└── modules/            # Business logic modules
    └── [module]/       # Each module = business feature
        ├── [some_component].vue    # Root component
        ├── types.ts        # Module-specific types (optional)
        └── use[Module]Store.ts # Module state
```

### Module Architecture

- Each module represents a business feature with its own component tree
- Module root components are typically used in `router.ts`
- Cross-module imports are allowed, but shared logic should generally be in `lib/` or `services/`
- Modules can have scoped state that's not global but shared within the module

## UI Components & Styling

### Shadcn/Vue Components

Install new components using:

```bash
pnpm dlx shadcn-vue@latest add button
```

To import a component, use this syntax:
```
import { Button } from '@/components/ui/button'
```

### Icons

Use Remixicon for all icons:

```vue
<template>
  <i class="ri-arrow-right-up-line"></i>
</template>
```

## State Management

State is implemented using `createInjectionState` from `@vueuse/core` instead of Pinia or Vuex.

### Scoped State (Module-level)

```typescript
// useCounterStore.ts
import { createInjectionState } from '@vueuse/core'
import { computed, shallowRef } from 'vue'

const [useProvideCounterStore, useCounterStore] = createInjectionState((initialValue: number) => {
  // State
  const count = shallowRef(initialValue)

  // Getters
  const double = computed(() => count.value * 2)

  // Actions
  function increment() {
    count.value++
  }

  return { count, double, increment }
})

export { useProvideCounterStore, useCounterStore }
```

**Root Component (Provider):**

```vue
<!-- ModuleRoot.vue -->
<script setup lang="ts">
import { useProvideCounterStore } from './useCounterStore'

useProvideCounterStore(0)
</script>

<template>
  <div>
    <slot />
  </div>
</template>
```

**Child Components (Consumers):**

```vue
<!-- CountComponent.vue -->
<script setup lang="ts">
import { useCounterStore } from './useCounterStore'

// Use non-null assertion for guaranteed provider context
const { count, double } = useCounterStore()!

// Alternative approaches:
// const { count, double } = useCounterStore() ?? defaultValues
// const { count, double } = useCounterStoreWithDefaultValue()
</script>

<template>
  <ul>
    <li>count: {{ count }}</li>
    <li>double: {{ double }}</li>
  </ul>
</template>
```

### Global State

For app-wide state (like user authentication), provide the store in `App.vue` instead of module root components.

## Code Style & Conventions

### TypeScript & Formatting

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: None
- **ESLint**: Strict TypeScript rules with stylistic formatting enabled

### Vue Components

Always use `<script setup>` with Composition API:

```vue
<template>
  <div>
    Login
  </div>
</template>

<script setup lang="ts">
// Component logic here
</script>
```

### Imports & Exports

- **Root alias**: `@` points to `src/` directory
- **Prefer named exports** over default exports
- **Import syntax**:

```typescript
import Login from '@/modules/account/Login.vue'
import { someUtil } from '@/lib/utils'
```

## Types

- **Global types**: Defined in `src/types.ts`
- **Module-specific types**: Create `types.ts` in the module directory or define inline where used
- **Component types**: Define locally within the component file


## Utilities
- **@vueuse/core**: Vue composition utilities (including state management)
- **@floating-ui/vue**: Tooltip and popover positioning
- **axios**: HTTP client
- **lodash-es**: Utility functions
- **luxon**: Date/time handling
