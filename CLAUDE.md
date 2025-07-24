# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack & Architecture

This is a **Shopify Hydrogen** storefront project built with:
- **React Router v7** (NOT Remix - see important note below)
- **Shopify Hydrogen** for e-commerce functionality
- **Vite** for build tooling
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **Oxygen** for Shopify hosting

## Key Development Commands

- `npm run dev` - Start development server with codegen
- `npm run build` - Build for production with codegen
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run codegen` - Generate GraphQL types

## Critical: React Router vs Remix

**This project uses React Router v7, NOT Remix.** The key import replacements are:

| ❌ Incorrect (Remix) | ✅ Correct (React Router) |
|---------------------|-------------------------|
| `@remix-run/react` | `react-router` |
| `@remix-run/dev` | `@react-router/dev` |
| `@remix-run/node` | `@react-router/node` |

**NEVER use `react-router-dom` imports!** Always use `react-router` for hooks like `useLoaderData`, `Link`, `Form`, etc.

## Project Structure

### Core Application Files
- `app/root.tsx` - Root layout with Analytics provider and dual-mode rendering (local dev vs production)
- `app/routes.ts` - Route configuration using `@react-router/fs-routes` and `hydrogenRoutes`
- `app/lib/context.ts` - Hydrogen context creation with session, cache, and i18n
- `react-router.config.ts` - React Router configuration
- `vite.config.ts` - Vite configuration with Hydrogen, Oxygen, and Tailwind plugins

### Routing
- File-based routing in `app/routes/` directory
- Routes follow `($locale).pattern.tsx` convention for internationalization
- Shopify-specific routes for cart, account, products, collections, etc.

### Key Libraries & Components
- `app/lib/fragments.ts` - GraphQL fragments for consistent queries
- `app/lib/i18n.ts` - Internationalization utilities
- `app/components/` - Reusable React components for storefront functionality

### Styling
- Uses Tailwind CSS v4 with `@tailwindcss/vite` plugin
- CSS imports: `reset.css`, `app.css`, `tailwind.css`
- Path alias: `~/*` maps to `app/*`

## Development Mode Features

The app supports local development with mock data when `PUBLIC_STOREFRONT_API_TOKEN === 'mock-token'`, providing a simple demo layout without requiring Shopify API access.

## GraphQL & API Integration

- Uses Shopify Storefront API and Customer Account API
- Auto-generated types in `storefrontapi.generated.d.ts` and `customer-accountapi.generated.d.ts`
- GraphQL fragments organized in `app/lib/fragments.ts` for reusability

## Important Notes

- Always run `npm run lint` and `npm run typecheck` after making changes
- The project uses SSR (Server-Side Rendering) by default
- Cart functionality is integrated via Hydrogen's cart context
- Analytics are provided through Shopify's Analytics provider

## Shopify Development Guidance

- When building something for Shopify, always check the latest documentation from context7

## Development Reminders

- When you build something, always check that it works with Playwright MCP