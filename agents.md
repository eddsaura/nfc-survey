# Agent Notes

## Project Overview

NFC Surveys is a React Native (Expo) app that allows users to vote via NFC tags. The app supports both native mobile (iOS/Android) and web platforms.

## Web-Based Voting Architecture

NFC tags contain HTTPS URLs (e.g., `https://your-app.vercel.app/survey/{surveyId}/yes`) that open directly in mobile browsers, allowing anyone to vote without installing the app.

### Key Implementation Details

#### Platform-Specific Storage
- **Native (iOS/Android):** Uses `@react-native-async-storage/async-storage`
- **Web:** Uses `localStorage` with SSR guard (`typeof window !== "undefined"`)
- Platform detection: `Platform.OS === "web"`

#### Environment Variables
- `EXPO_PUBLIC_CONVEX_URL` - Convex backend URL
- `EXPO_PUBLIC_WEB_DOMAIN` - Web deployment domain (used for generating NFC tag URLs)

#### Web Navigation Handling
On web, users land directly on vote pages via NFC scan. Unlike native, there's no "home" to navigate to after voting. The app:
- Hides "Go Home" / "Done" buttons on web
- Shows a static "Thank You" confirmation instead of navigating away

## Vercel Deployment

### Build Command
```
pnpm exec convex deploy --cmd-url-env-var-name EXPO_PUBLIC_CONVEX_URL --cmd 'pnpm run build:web'
```

This command:
1. Deploys Convex functions to production
2. Sets `EXPO_PUBLIC_CONVEX_URL` automatically for the build
3. Runs the Expo web export

### Required Environment Variables in Vercel
- `CONVEX_DEPLOY_KEY` - Production deploy key from Convex Dashboard (Production environment only)
- `EXPO_PUBLIC_WEB_DOMAIN` - Your Vercel domain (e.g., `your-app.vercel.app`)

### URL Rewrites
Dynamic routes need rewrites in `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/survey/:surveyId/:response", "destination": "/survey/[surveyId]/[response].html" },
    { "source": "/follow-up/:surveyId", "destination": "/follow-up/[surveyId].html" }
  ]
}
```

### Build Issues Encountered
- **Don't use `pnpx` for build commands** - Metro bundler fails with SHA-1 resolution errors because `pnpx` runs from a temporary cache location
- **Use locally installed packages** - `pnpm run build:web` or `pnpm exec` to use packages from `node_modules`

## Mobile Web Optimizations

Meta tags in `app/+html.tsx`:
- `user-scalable=no` - Prevents accidental zoom on vote buttons
- `mobile-web-app-capable` - Enables "Add to Home Screen" functionality
- `theme-color` - Colors the browser chrome to match the app

## NFC Tag Format

URLs written to NFC tags:
```
https://{WEB_DOMAIN}/survey/{surveyId}/{yes|no}
```

The app parses both custom scheme (`nfcsurvey://`) and HTTPS URLs for backwards compatibility.
