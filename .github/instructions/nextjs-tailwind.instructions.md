---
description: 'Next.js + Tailwind development standards and instructions'
applyTo: '**/*.tsx, **/*.ts, **/*.jsx, **/*.js, **/*.css'
---

# Next.js + Tailwind Development Instructions

Instructions for high-quality Next.js applications with Tailwind CSS styling and TypeScript.

## Project Context

- Latest Next.js (App Router)
- TypeScript for type safety
- Tailwind CSS for styling

## Development Standards

### Architecture
- App Router with server and client components
- Group routes by feature/domain
- Implement proper error boundaries
- Use React Server Components by default
- Leverage static optimization where possible

### Styling
- Tailwind CSS with consistent color palette
- Responsive design patterns
- Dark mode support
- Maintain semantic HTML structure

### Performance
- Image optimization with next/image
- Font optimization with next/font
- Route prefetching
- Proper code splitting
- Bundle size optimization
