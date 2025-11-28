# SaaS Landing Page Template

A modern, professional landing page and pricing page template extracted from JaxSaver. Built with React, TypeScript, Vite, Material-UI, and Framer Motion.

## Features

- **Finta-style Landing Page** - Clean, professional design with animated sections
- **Pricing Page** - Stripe-integrated pricing table
- **Dark/Light Theme** - Automatic theme switching
- **Fully Responsive** - Mobile-first design
- **Authentication Ready** - Clerk integration for auth
- **Analytics Ready** - PostHog and Google Analytics integration

## Folder Structure

```
extracted-landing-template/
├── pages/                    # Page components
│   ├── Home.tsx             # Homepage wrapper
│   ├── BusinessLandingPage.tsx  # Main landing page
│   ├── PricingPage.tsx      # Pricing page
│   ├── ContactPage.tsx      # Contact page
│   ├── TermsPage.tsx        # Terms of service
│   └── PrivacyPolicyPage.tsx # Privacy policy
├── components/
│   ├── landing/             # Landing page sections
│   │   ├── FintaStyleLanding.tsx    # Main component with all sections
│   │   ├── BusinessHero.tsx         # Hero section
│   │   ├── LandingFooter.tsx        # Footer
│   │   ├── PricingPreview.tsx       # Pricing preview
│   │   ├── BenefitsCards.tsx        # Benefits cards
│   │   ├── FeatureHighlights.tsx    # Feature highlights
│   │   ├── FeatureSections.tsx      # Feature sections
│   │   ├── HowItWorks.tsx           # How it works
│   │   ├── FAQAccordion.tsx         # FAQ section
│   │   ├── TestimonialsGrid.tsx     # Testimonials (in FintaStyleLanding)
│   │   ├── TrustedByMarquee.tsx     # Trusted by logos
│   │   ├── SocialProof.tsx          # Social proof section
│   │   ├── ValueProposition.tsx     # Value proposition
│   │   ├── ProblemSolutionSplit.tsx # Problem/solution layout
│   │   ├── ProductDemoBento.tsx     # Product demo bento grid
│   │   └── FinalCTA.tsx             # Final call to action
│   └── pricing/             # Pricing components
│       ├── PricingTable.tsx         # Main pricing table
│       ├── PricingTable.examples.tsx # Usage examples
│       └── index.ts                 # Exports
├── layouts/
│   └── LandingLayout.tsx    # Landing page layout with nav
├── hooks/                   # Custom React hooks
├── contexts/                # React context providers
├── theme/                   # MUI theme configuration
├── utils/                   # Utility functions
├── providers/               # Provider components
├── assets/                  # Images and media
├── public/                  # Public static files
└── config/                  # Build configuration files
```

## Key Components

### FintaStyleLanding.tsx
The main landing page component exports these sections:
- `Hero` - Main hero with headline and CTA
- `FeatureCardsSection` - Feature cards grid
- `BigQuote` - Large testimonial quotes
- `SupportFeaturesSection` - Support features
- `AutomationSection` - Automation features
- `InsightsSection` - Analytics/insights section
- `IntegrationsSection` - Integration showcase
- `MenuShowcaseSection` - Mobile menu demo
- `TestimonialsGrid` - Customer testimonials
- `FinalCTA` - Final call to action

### BusinessLandingPage.tsx
Composes the full landing page using FintaStyleLanding sections.

## Dependencies

Install these npm packages:

```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install framer-motion lucide-react react-router-dom
npm install @clerk/clerk-react  # For authentication
npm install posthog-js          # For analytics
npm install convex              # For backend (optional)
npm install date-fns zod axios
```

## Environment Variables

Create a `.env` file:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx

# Convex Backend (optional)
VITE_CONVEX_URL=https://xxx.convex.cloud

# PostHog Analytics (optional)
VITE_POSTHOG_KEY=phc_xxx
VITE_POSTHOG_HOST=https://us.i.posthog.com

# Stripe (for pricing table)
VITE_STRIPE_PRICING_TABLE_ID=prctbl_xxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Google Analytics (optional)
VITE_GA_MEASUREMENT_ID=G-xxx
```

## Quick Start

1. **Copy the template to your project:**
   ```bash
   cp -r extracted-landing-template/* your-project/src/
   ```

2. **Install dependencies** (see above)

3. **Update branding:**
   - Replace logo in `assets/` and `public/`
   - Update colors in `theme/palette.ts`
   - Update company name in components

4. **Configure authentication:**
   - Set up Clerk account and add keys to `.env`
   - Or replace Clerk with your auth provider

5. **Set up routes:**
   ```tsx
   import Home from './pages/Home';
   import PricingPage from './pages/PricingPage';

   <Route path="/" element={<Home />} />
   <Route path="/pricing" element={<PricingPage />} />
   ```

## Customization

### Theme Colors
Edit `theme/palette.ts`:
```typescript
export const palette = {
  primary: {
    main: '#fbbf24',  // Golden yellow
  },
  secondary: {
    main: '#1e293b',  // Slate blue
  },
};
```

### Typography
Edit `theme/typography.ts` for fonts.

### Content
Edit section content directly in:
- `FintaStyleLanding.tsx` - Main landing sections
- `BusinessLandingPage.tsx` - Page composition
- Individual section components

## Removing JaxSaver-Specific Code

To make this template generic:

1. **Replace imports:**
   - Change `@jaxsaver/shared` imports to local types
   - Remove Convex-specific queries or mock them

2. **Update branding:**
   - Replace "JaxSaver" with your brand name
   - Update logos in `assets/` folder

3. **Remove unused features:**
   - PostHog feature flags (search for `useFeatureFlagEnabled`)
   - Convex queries (search for `useQuery(api.`)
   - Clerk auth if using different provider

## File Size Summary

```
Pages:           ~50 KB
Landing Components: ~100 KB
Pricing Components: ~30 KB
Theme:           ~20 KB
Assets:          ~25 MB (images/gifs)
Total (code):    ~200 KB
```

## Tech Stack

- **React 18** + TypeScript
- **Vite** - Build tool
- **Material-UI v5** - UI components
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Clerk** - Authentication
- **PostHog** - Analytics
- **Stripe** - Payments

## License

This template is extracted from JaxSaver for personal/commercial reuse.
