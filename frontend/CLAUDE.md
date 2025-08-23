# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands
- `pnpm dev` - Start development server on port 3009 with VITE_ENV=dev

## Architecture Overview

This is a Vue 3 frontend application built with Vite and TypeScript, named "Voice 1". The project follows a minimal structure:

- **Vue 3 + TypeScript**: Core framework with strict type checking enabled
- **Vite**: Build tool with base path set to `/app/`
- **Vue Router**: Routing handled through router-view in App.vue
- **Tailwind CSS**: Utility-first CSS framework with dark mode support via selector
- **Pinia**: State management (dependency included)
- **Shadcn UI**: Component library via shadcn/vue, components are in `src/components/ui`. 
  - Command to download components: `pnpm dlx shadcn-vue@latest add button`

## Key Configuration
- **Alias**: `@` points to `src/` directory
- **ESLint**: Strict TypeScript rules with stylistic formatting (2-space indent, single quotes, no semicolons)
- **Environment Variables**: Uses VITE_ENV for environment-specific builds

## Dependencies of Note
- **@floating-ui/vue**: Floating UI positioning
- **@vueuse/core**: Vue composition utilities
- **axios**: HTTP client
- **lodash-es**: Utility library
- **luxon**: Date/time handling
- **remixicon**: Icon library

## Code Style
- 2-space indentation
- Single quotes for strings
- No semicolons
- Vue SFC with TypeScript setup syntax