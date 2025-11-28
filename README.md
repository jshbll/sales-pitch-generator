# AI Sales Pitch Generator

Generate professional sales pitch scripts and audio using AI. Answer 8 quick questions about your business, and get a polished sales pitch script converted to professional audio.

## Features

- **Smart Wizard** - 8 targeted questions to understand your pitch needs
- **AI Script Generation** - Powered by Qwen AI for natural, persuasive scripts
- **Professional Audio** - ElevenLabs text-to-speech with multiple voice options
- **Custom Voice Support** - Use your own cloned voice for brand consistency
- **Business Profiles** - Save multiple business backgrounds for quick reference
- **Usage Tracking** - Monitor AI costs in development mode

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Clerk account (https://clerk.dev)
- Convex account (https://convex.dev)
- Qwen API key (https://dashscope.console.aliyun.com)
- ElevenLabs API key (https://elevenlabs.io)

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd sales-pitch-generator

# Install dependencies
npm install

# Set up Convex
npx convex dev
# Follow prompts to create new deployment

# Copy environment template
cp .env.example .env
# Fill in your Clerk publishable key and Convex URL
```

### Environment Setup

#### Frontend (.env)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

#### Convex Dashboard
Go to your Convex dashboard → Settings → Environment Variables:

```
CLERK_SECRET_KEY=sk_test_...
QWEN_API_KEY=sk-...
QWEN_API_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_CUSTOM_VOICE_ID=  # Optional
```

### Running

```bash
# Start both Convex and Vite
npm run dev:all

# Or run separately
npm run dev:convex  # Terminal 1
npm run dev         # Terminal 2
```

Visit http://localhost:5173

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| UI | Material-UI, Tailwind CSS |
| Backend | Convex |
| Auth | Clerk |
| AI Script | Qwen (Alibaba DashScope) |
| AI Audio | ElevenLabs |

## Project Structure

```
├── convex/              # Backend functions & schema
├── src/
│   ├── pages/           # Route pages
│   ├── components/      # React components
│   ├── audio-generator/ # Wizard logic & types
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   └── utils/           # Utilities
├── CLAUDE.md            # AI assistant instructions
└── .env.example         # Environment template
```

## How It Works

1. **Wizard** - User answers 8 questions about their pitch
2. **Prompt Building** - Answers are structured into an AI prompt
3. **Script Generation** - Qwen AI generates the sales pitch script
4. **Review & Edit** - User can review and regenerate if needed
5. **Audio Generation** - ElevenLabs converts script to audio
6. **Download** - User downloads the final audio file

## Available Scripts

```bash
npm run dev        # Start Vite dev server
npm run dev:convex # Start Convex dev server
npm run dev:all    # Start both concurrently
npm run build      # Production build
npm run lint       # ESLint check
```

## Cost Estimates

| Service | Operation | Approximate Cost |
|---------|-----------|------------------|
| Qwen | Script (~500 tokens) | ~$0.001 |
| ElevenLabs | Preview audio (~1000 chars) | ~$0.015 |
| ElevenLabs | HQ audio (~1000 chars) | ~$0.03 |

*Costs tracked in dev mode via DevUsageTracker component*

## Deployment

### Convex
```bash
npx convex deploy --prod
```

### Frontend
Build and deploy `dist/` to any static hosting:
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

## Contributing

1. Create a feature branch
2. Make changes
3. Test the full wizard flow
4. Submit PR

## License

MIT
