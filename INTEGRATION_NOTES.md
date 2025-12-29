# ReflectivAI Repository Integration

## Overview

Successfully integrated the stable ReflectivAI codebase from the GitHub repository into the AiroApp template. This document outlines what was copied, configured, and how to use the integrated system.

## What Was Integrated

### 1. Pages (11 total)
All application pages from the cloned repository:
- `chat.tsx` - AI chat interface with conversation history
- `roleplay.tsx` - Interactive roleplay scenarios for sales training
- `dashboard.tsx` - Main dashboard with metrics and overview
- `frameworks.tsx` - Signal Intelligence™ framework documentation
- `modules.tsx` - Training modules and learning paths
- `exercises.tsx` - Practice exercises for skill development
- `knowledge.tsx` - Knowledge base and documentation
- `heuristics.tsx` - Heuristic analysis tools
- `ei-metrics.tsx` - Emotional Intelligence metrics tracking
- `data-reports.tsx` - Data analytics and reporting
- `sql.tsx` - SQL query interface for data exploration

### 2. Custom Components (8 total)
- `api-status.tsx` - API connection status indicator
- `app-sidebar.tsx` - Application sidebar navigation
- `eq-metric-card.tsx` - EQ metric display cards
- `live-eq-analysis.tsx` - Real-time EQ analysis visualization
- `roleplay-feedback-dialog.tsx` - Feedback dialog for roleplay sessions
- `signal-intelligence-panel.tsx` - Signal Intelligence™ visualization
- `theme-provider.tsx` - Dark/light theme management
- `theme-toggle.tsx` - Theme switcher component

### 3. UI Components
Added missing shadcn UI components:
- `toaster.tsx` - Toast notification system
- `sidebar.tsx` - Sidebar layout component
- `toast.tsx` - Individual toast component
- `radio-group.tsx` - Radio button group
- `chart.tsx` - Chart visualization components
- `toggle-group.tsx` - Toggle button group

### 4. Hooks & Utilities
- `use-mobile.tsx` - Mobile device detection hook
- `use-toast.ts` - Toast notification hook
- `data.ts` - Application data and constants (77KB)
- `eiMetricSettings.ts` - EI metric configuration
- `queryClient.ts` - React Query client configuration

### 5. Shared Schema
- `shared/schema.ts` - Shared TypeScript types and Zod schemas

### 6. Routing & Configuration
- Updated `App.tsx` to use `wouter` routing instead of React Router
- Integrated sidebar layout with theme support
- Added API status monitoring to header

### 7. Styles
- Replaced `src/styles/globals.css` with styles from cloned repo
- Includes custom CSS variables and animations

### 8. Dependencies Added
- `wouter` - Lightweight routing library
- `framer-motion` - Animation library
- `recharts` - Chart visualization library
- `react-icons` - Icon library

## Configuration Changes

### TypeScript Configuration
Added `@shared` path alias to `tsconfig.json`:
```json
"paths": {
  "@/api/*": ["./src/server/api/*"],
  "@/*": ["./src/*"],
  "@shared/*": ["./shared/*"]
}
```

### Vite Configuration
Added `@shared` alias to `vite.config.ts`:
```typescript
alias: {
  "@shared": path.resolve(__dirname, "./shared"),
}
```

### Environment Variables
Created `.env` file with required configuration:
```bash
# Application
VITE_APP_NAME=ReflectivAI
VITE_PUBLIC_URL=https://yxpzdb7o9z.preview.c24.airoapp.ai
VITE_API_URL=http://localhost:3000/api

# Cloudflare Worker API Configuration
VITE_API_BASE_URL=https://your-worker.your-subdomain.workers.dev

# Server
NODE_ENV=development
PORT=3000
```

**IMPORTANT:** You need to update `VITE_API_BASE_URL` with your actual Cloudflare Worker URL.

### Entry Point
Updated `src/main.tsx` to match cloned repo structure:
- Changed from `ReactDOM.createRoot` with providers to simple `createRoot`
- Moved providers into `App.tsx`
- Changed root element ID from `app` to `root`

Updated `index.html`:
- Changed `<div id="app">` to `<div id="root">`

## Application Structure

The integrated application now has:

### Layout
- **Sidebar Navigation**: Collapsible sidebar with all page links
- **Header**: API status badge and theme toggle
- **Main Content**: Full-height scrollable content area
- **Theme Support**: Dark/light mode with system preference detection

### Routing
All routes are configured in `App.tsx` using wouter:
- `/` - Dashboard (home page)
- `/chat` - AI Chat Interface
- `/roleplay` - Roleplay Scenarios
- `/exercises` - Practice Exercises
- `/modules` - Training Modules
- `/frameworks` - Framework Documentation
- `/ei-metrics` - EI Metrics
- `/data-reports` - Data Reports
- `/knowledge` - Knowledge Base
- `/sql` - SQL Interface
- `/heuristics` - Heuristics Analysis

## Cloudflare Worker Integration

The application is designed to connect to a Cloudflare Worker backend that provides:

### Required Endpoints
- `POST /chat` - AI chat completions
- `POST /facts` - Fact extraction from conversations
- `POST /plan` - Generate coaching plans
- `GET /health` - Health check endpoint
- `GET /version` - API version information
- `GET /debug/ei` - EI metrics debugging

### API Configuration
The worker URL is configured via `VITE_API_BASE_URL` environment variable. The cloned repository includes a complete Cloudflare Worker implementation in `/tmp/reflectiv-repo/index.ts`.

### Worker Features
- **Provider Integration**: Groq API for LLM completions
- **Key Rotation**: Round-robin API key rotation for rate limiting
- **CORS Support**: Configurable CORS origins
- **Timeout Handling**: 25s timeout for chat, 15s for Alora, 5s for health checks
- **Session State**: Optional KV namespace for session persistence

## Next Steps

### 1. Deploy Cloudflare Worker
1. Copy the worker code from `/tmp/reflectiv-repo/index.ts`
2. Configure environment variables:
   - `PROVIDER_URL` - Groq API URL
   - `PROVIDER_MODEL` - Model name (e.g., llama-3.1-70b-versatile)
   - `PROVIDER_KEY` or `PROVIDER_KEYS` - API keys
   - `CORS_ORIGINS` - Allowed origins (include your preview URL)
3. Deploy to Cloudflare Workers
4. Update `.env` with your worker URL

### 2. Test All Pages
Navigate through each page to verify:
- ✅ Dashboard loads with metrics
- ✅ Chat interface connects to worker
- ✅ Roleplay scenarios load correctly
- ✅ All navigation links work
- ✅ Theme toggle functions
- ✅ API status indicator shows connection state

### 3. Configure API Keys
If your worker requires authentication:
1. Add `VITE_API_KEY` to `.env`
2. Update API client to include auth headers

### 4. Customize Branding
- Update `VITE_APP_NAME` in `.env`
- Customize colors in `src/styles/globals.css`
- Update logo and favicon

## Known Issues

### TypeScript Warnings
There are some non-critical TypeScript warnings:
- Unused imports (TS6133) - Can be safely ignored or cleaned up
- Chart component type issues - Does not affect functionality
- Implicit 'any' types in some callbacks - Does not affect runtime

These warnings do not prevent the application from running.

### Missing Features
The following features from the original repo may need additional configuration:
- Database integration (if using Neon/PostgreSQL)
- Authentication system (if required)
- Session management (if using KV storage)

## File Structure

```
.
├── shared/
│   └── schema.ts                    # Shared types and schemas
├── src/
│   ├── components/
│   │   ├── ui/                      # 48 shadcn UI components
│   │   ├── api-status.tsx
│   │   ├── app-sidebar.tsx
│   │   ├── eq-metric-card.tsx
│   │   ├── live-eq-analysis.tsx
│   │   ├── roleplay-feedback-dialog.tsx
│   │   ├── signal-intelligence-panel.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── data.ts                  # 77KB of application data
│   │   ├── eiMetricSettings.ts
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── chat.tsx
│   │   ├── roleplay.tsx
│   │   ├── dashboard.tsx
│   │   ├── frameworks.tsx
│   │   ├── modules.tsx
│   │   ├── exercises.tsx
│   │   ├── knowledge.tsx
│   │   ├── heuristics.tsx
│   │   ├── ei-metrics.tsx
│   │   ├── data-reports.tsx
│   │   └── sql.tsx
│   ├── styles/
│   │   └── globals.css              # Integrated styles from cloned repo
│   ├── App.tsx                      # Wouter routing + providers
│   └── main.tsx                     # Entry point
├── .env                             # Environment configuration
├── index.html                       # Updated root element ID
├── package.json                     # Added dependencies
├── tsconfig.json                    # Added @shared alias
└── vite.config.ts                   # Added @shared alias
```

## Development Commands

```bash
# Start development server
npm run dev

# Type check
npm run type-check

# Build for production
npm run build

# Run tests
npm run test
```

## Support

For issues or questions:
1. Check the Cloudflare Worker logs for API errors
2. Verify `VITE_API_BASE_URL` is correctly configured
3. Ensure CORS origins include your preview URL
4. Check browser console for client-side errors

## Summary

The ReflectivAI application has been successfully integrated with:
- ✅ 11 pages copied and configured
- ✅ 8 custom components integrated
- ✅ All UI components in place
- ✅ Routing configured with wouter
- ✅ Theme support enabled
- ✅ API status monitoring active
- ✅ Dependencies installed
- ✅ TypeScript configured
- ✅ Environment variables set up
- ✅ Development server running

The application is ready for Cloudflare Worker integration and testing.
