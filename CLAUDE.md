# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Sales Pitch Generator - users answer 8 questions about their business, Qwen AI generates a sales script, and ElevenLabs converts it to audio.

**Tech Stack**: React 18 + TypeScript + Vite + MUI frontend, Convex backend, Clerk auth, Qwen (DashScope) for AI, ElevenLabs for TTS.

## Development Commands

```bash
npm run dev:all      # Start Convex + Vite concurrently
npm run dev:convex   # Convex backend only
npm run dev          # Vite frontend only (port 5173)
npm run build        # Production build
npm run lint         # ESLint
npx convex deploy --prod  # Deploy Convex to production
```

## Architecture

### Audio Generation Flow
1. User completes 8-question wizard → answers stored in React state
2. `src/audio-generator/promptBuilder.ts` constructs AI prompt from answers
3. `convex/audioGenerator.ts:create` mutation saves draft record
4. `generateScript` action calls Qwen API → script saved to DB
5. User can edit/regenerate script
6. `generateAudio` action calls ElevenLabs → audio stored in Convex storage

### Status State Machine (audio_generations.status)
```
draft → script_generating → script_ready → preview_generating → preview_ready → hq_generating → hq_ready
                 ↓                                    ↓                                ↓
              failed                               failed                           failed
```

### Key Files
- `convex/audioGenerator.ts` - Core AI generation logic, pricing constants, ElevenLabs voice mappings
- `convex/schema.ts` - Database schema
- `src/audio-generator/questions.ts` - Wizard question definitions (8 questions)
- `src/audio-generator/promptBuilder.ts` - Constructs AI prompts from wizard answers
- `src/audio-generator/hooks/useWizard.ts` - Wizard state management

### AI Service Configuration

**Qwen** (script generation):
- Model: `qwen-plus` via DashScope API
- Endpoint: `QWEN_API_BASE_URL` env var (default: `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`)

**ElevenLabs** (TTS):
- Preview: `eleven_turbo_v2_5` model
- HQ: `eleven_multilingual_v2` model
- Voice IDs are mapped in `convex/audioGenerator.ts:239-259` (e.g., "rachel", "drew", "sarah")
- Custom cloned voice: set `ELEVENLABS_CUSTOM_VOICE_ID` env var

### Authentication
- Clerk handles auth and billing
- `SimpleAuthContext` wraps Clerk for app-specific state
- Business profiles linked via `clerk_user_id` field

## Important Rules

### DO
- Use Convex mutations/actions for all backend operations (never call AI APIs from frontend)
- Track AI usage via `ai_usage_tracking` table for cost monitoring
- Test wizard flow end-to-end when making changes to questions or prompt building

### DON'T
- Don't modify wizard questions without updating `promptBuilder.ts`
- Don't use `React.memo`, `useCallback`, `useMemo` unless there's a measured performance issue

### Import Patterns
```typescript
// Frontend → Convex
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

// Within Convex
import { v } from 'convex/values';
import { mutation, query, action } from './_generated/server';
import { api, internal } from './_generated/api';
```

## Environment Variables

**Frontend (.env)**
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_CONVEX_URL`

**Convex Dashboard**
- `CLERK_SECRET_KEY`
- `QWEN_API_KEY`
- `QWEN_API_BASE_URL`
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_CUSTOM_VOICE_ID` (optional)

## Debugging

**DevUsageTracker**: Floating panel in dev mode showing real-time AI costs (only when `import.meta.env.DEV` is true).

**Common Issues**:
- Script generation fails → Check Qwen API key and endpoint in Convex dashboard
- Audio generation fails → Check ElevenLabs API key; verify voice ID exists
- Import errors → Run `npx convex dev` to regenerate types

## Historical Notes

- Wizard reduced from 26 questions to 8 for better UX
- Switched from OpenAI to Qwen for cost efficiency
- Switched from OpenAI TTS to ElevenLabs for better voice quality
