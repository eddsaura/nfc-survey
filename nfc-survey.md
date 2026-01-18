# NFC Survey App

## Overview

A React Native application that transforms physical NFC tags into instant survey and voting touchpoints. Users tap an NFC tag to cast a vote or answer a question, with optional follow-up questions delivered through a native mobile experience.

---

## Core Concept

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   NFC Tag   │ ──▶  │     App     │ ──▶  │   Convex    │
│  (Yes/No)   │      │             │      │   Backend   │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  Follow-up  │
                     │  Questions  │
                     │  (Native)   │
                     └─────────────┘
```

---

## How It Works

1. **Admin sets up a survey** with a unique ID
2. **NFC tags are programmed** with endpoint URLs:
   - Tag A: `https://yourapp.com/survey/{surveyId}/yes`
   - Tag B: `https://yourapp.com/survey/{surveyId}/no`
3. **User taps a tag** with their phone
4. **App intercepts the URL**, registers the vote
5. **Optional follow-up questions** appear natively in the app
6. **Results are collected** in real-time

---

## MVP Features

### 1. NFC Tag Programming
- Write custom URLs to NFC tags
- Support for NDEF format (universal compatibility)
- Tag templates for quick setup

### 2. Survey Endpoint Structure
```
Base URL: https://yourapp.com/survey/

Endpoints:
  POST /{surveyId}/yes    → Register "Yes" vote
  POST /{surveyId}/no     → Register "No" vote
  GET  /{surveyId}/results → Get survey results
```

### 3. Vote Registration
- Instant vote capture on tag tap
- Offline support with sync when connected
- Duplicate vote prevention (optional)

### 4. Follow-up Questions (Native Experience)
- Configurable per survey
- Native UI components (not webview)
- Question types:
  - Multiple choice
  - Rating scale (1-5, 1-10)
  - Short text input
  - Yes/No confirmation

---

## User Flows

### Flow A: Simple Vote (No Follow-up)
```
User taps NFC tag
        ↓
App opens & registers vote
        ↓
"Thanks for voting!" confirmation
        ↓
Done
```

### Flow B: Vote with Follow-up Questions
```
User taps NFC tag
        ↓
App opens & registers initial vote
        ↓
Native follow-up screen appears
        ↓
User answers additional questions
        ↓
All responses submitted
        ↓
"Thanks for your feedback!" confirmation
```

---

## Technical Architecture

### Tech Stack
| Layer | Technology |
|-------|------------|
| Mobile App | React Native + Expo |
| NFC | react-native-nfc-manager |
| Navigation | Expo Router |
| Animations | react-native-reanimated |
| State | Zustand or Redux Toolkit |
| Backend | Convex (serverless functions) |
| Database | Convex |
| Analytics | PostHog |
| Deep Linking | Expo Linking / Universal Links |

### URL Scheme & Deep Linking (Expo Router)
```
Custom scheme: yourapp://
Universal links: https://yourapp.com/*

Routes map directly to file structure:
  /survey/abc123/yes  →  app/survey/[surveyId]/[response].tsx
  /survey/abc123/no   →  app/survey/[surveyId]/[response].tsx

Examples:
  yourapp://survey/abc123/yes
  https://yourapp.com/survey/abc123/no
```

---

## Native Follow-up Experience

### Design Principles
- **No webviews** — All questions rendered with native components
- **Fast & fluid** — Native animations with react-native-reanimated (layout transitions, entering/exiting)
- **Accessible** — Full VoiceOver/TalkBack support
- **Offline-capable** — Questions cached, responses synced later

### Native Components Used
| Question Type | React Native Component |
|---------------|----------------------|
| Multiple Choice | `Pressable` + custom styling |
| Rating Scale | Custom `StarRating` or `Slider` |
| Text Input | `TextInput` with native styling |
| Yes/No | `Switch` or styled `Pressable` buttons |

---

## MVP Scope

### ✅ In Scope (v1.0)
- [ ] NFC tag reading (iPhone 7+ / Android)
- [ ] NFC tag writing (program tags with URLs)
- [ ] Deep link handling for survey URLs
- [ ] Simple yes/no vote registration
- [ ] Configurable follow-up questions (native UI)
- [ ] Vote confirmation screen
- [ ] Basic survey creation
- [ ] Results viewing
- [ ] Admin web dashboard

### ❌ Out of Scope (Future)
- Advanced analytics
- Multi-language support
- Custom branding per survey
- Team/organization features
- Export functionality

---

## Implementation Priority

### 1. First — Core Infrastructure
- Expo project setup with dev build (required for NFC)
- NFC read/write implementation
- Deep linking configuration
- Basic navigation structure

### 2. Then — Voting Flow
- Survey endpoint integration
- Vote registration flow
- Confirmation screens

### 3. Next — Follow-up System
- Native question components
- Follow-up flow implementation
- Response submission
- Survey configuration system

### 4. Later — Reliability & Polish
- Offline vote queuing
- Error handling
- UI/UX refinement

### 5. Finally — Distribution
- Testing on multiple devices
- App store preparation

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Tag scan to vote registered | < 2 seconds |
| Follow-up completion rate | > 60% |
| App crash rate | < 0.1% |
| Offline sync success | > 99% |

---

## Open Questions (Resolved)

1. **Authentication** — Anonymous for MVP. Use device fingerprint stored in AsyncStorage + PostHog identify to tag users for analytics and rate limiting.
2. **Tag management** — Simply rewrite a new tag if lost/stolen.
3. **Rate limiting** — Use the anonymous device ID to prevent duplicate votes from the same device.
4. **Multi-option surveys** — Not for MVP, stick with yes/no.

---

## Resources

- [Convex docs](https://docs.convex.dev/)
- [Convex + React Native](https://docs.convex.dev/client/react-native)
- [Expo Router docs](https://docs.expo.dev/router/introduction/)
- [react-native-nfc-manager docs](https://github.com/revtel/react-native-nfc-manager)
- [Expo Router Deep Linking](https://docs.expo.dev/router/reference/url-parameters/)
- [Apple Core NFC](https://developer.apple.com/documentation/corenfc)
- [Android NFC Guide](https://developer.android.com/guide/topics/connectivity/nfc)