---
description: 'VueJS 3 development standards and best practices with Composition API and TypeScript'
applyTo: '**/*.vue, **/*.ts, **/*.js, **/*.scss'
---

# VueJS 3 Development Instructions

Instructions for building high-quality VueJS 3 applications with the Composition API, TypeScript, and modern best practices.

## Project Context
- Vue 3.x with Composition API as default
- TypeScript for type safety
- Single File Components (`.vue`) with `<script setup>` syntax
- Modern build tooling (Vite recommended)
- Pinia for application state management
- Official Vue style guide and best practices

## Development Standards

### Architecture
- Favor the Composition API (`setup` functions and composables) over the Options API
- Organize components and composables by feature or domain for scalability
- Separate UI-focused components (presentational) from logic-focused components (containers)
- Extract reusable logic into composable functions in a `composables/` directory
- Structure store modules (Pinia) by domain, with clearly defined actions, state, and getters

### Component Design
- Use `<script setup>` syntax for brevity and performance
- Keep components small and focused on one concern
- Use PascalCase for component names and kebab-case for file names
- Validate props with TypeScript; use runtime checks only when necessary
- Favor slots and scoped slots for flexible composition

### State Management
- Use Pinia for global state: define stores with `defineStore`
- For simple local state, use `ref` and `reactive` within `setup`
- Use `computed` for derived state
- Keep state normalized for complex structures
- Use actions in Pinia stores for asynchronous logic

### Performance Optimization
- Lazy-load components with dynamic imports and `defineAsyncComponent`
- Use `<Suspense>` for async component loading fallbacks
- Apply `v-once` and `v-memo` for static or infrequently changing elements
- Profile with Vue DevTools Performance tab
- Avoid unnecessary watchers; prefer `computed` where possible

### Testing
- Write unit tests with Vue Test Utils and Vitest
- Focus on behavior, not implementation details
- Use `mount` and `shallowMount` for component isolation
- Mock global plugins (router, Pinia) as needed
- Add end-to-end tests with Cypress or Playwright
