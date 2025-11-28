# PricingTable Component

A reusable, fully-featured pricing table component that maintains consistency across the entire application.

## Features

✅ **Single Source of Truth** - Fetches plan data from Convex backend
✅ **Highly Customizable** - Extensive props for different use cases
✅ **Responsive Design** - Mobile-first, looks great on all screen sizes
✅ **Consistent Styling** - Matches JaxSaver brand (black, gold, modern)
✅ **Annual/Monthly Toggle** - Built-in billing period switcher
✅ **Trial Badges** - Shows trial information when applicable
✅ **Trust Badges** - Security and trust messaging at bottom
✅ **Framer Motion** - Smooth animations and transitions
✅ **TypeScript** - Fully typed for IDE autocomplete

## Installation

The component is already available in the codebase:

```typescript
import { PricingTable, PlanCardData } from '@/components/pricing/PricingTable';
```

## Basic Usage

### Marketing Site (Simplest)

```tsx
import { PricingTable } from '@/components/pricing/PricingTable';
import { useNavigate } from 'react-router-dom';

export const PricingPage = () => {
  const navigate = useNavigate();

  return (
    <PricingTable
      onPlanClick={(plan) => {
        if (plan.isCustom) {
          navigate('/contact');
        } else {
          navigate(`/checkout?plan=${plan.clerkPlanId}`);
        }
      }}
    />
  );
};
```

### Checkout Page

```tsx
import { PricingTable, PlanCardData } from '@/components/pricing/PricingTable';
import { useNavigate } from 'react-router-dom';
import { CheckoutButton } from '@clerk/clerk-react/experimental';

export const CheckoutPage = () => {
  const navigate = useNavigate();

  return (
    <PricingTable
      onPlanClick={(plan) => {
        if (plan.isCustom) {
          navigate('/contact');
        }
        // For paid plans, CheckoutButton handles the flow
      }}
      getButtonText={(plan) =>
        plan.isCustom ? 'Contact Sales' : 'Start Free Trial'
      }
      headerTitle="Choose Your Plan"
      headerSubtitle="Start your 7-day free trial. Cancel anytime."
    />
  );
};
```

### Settings/Subscription Management

```tsx
import { PricingTable } from '@/components/pricing/PricingTable';

export const SubscriptionSettings = ({ currentPlanId }: { currentPlanId: string }) => {
  return (
    <PricingTable
      onPlanClick={(plan) => {
        // Handle plan change
      }}
      getButtonText={(plan) => {
        if (plan.clerkPlanId === currentPlanId) return 'Current Plan';
        if (plan.isCustom) return 'Contact Sales';
        return 'Switch Plan';
      }}
      getButtonDisabled={(plan) => plan.clerkPlanId === currentPlanId}
      showTrialBadge={false}
      showTrustBadges={false}
      headerTitle="Manage Subscription"
    />
  );
};
```

## Props API

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `onPlanClick` | `(plan: PlanCardData) => void` | Callback when user clicks a plan button |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `getButtonText` | `(plan: PlanCardData) => string` | Auto | Override button text for plans |
| `getButtonDisabled` | `(plan: PlanCardData) => boolean` | `false` | Control button disabled state |
| `getButtonVariant` | `(plan: PlanCardData) => 'contained' \| 'outlined'` | Auto | Control button style variant |
| `showBillingToggle` | `boolean` | `true` | Show annual/monthly toggle |
| `defaultBillingPeriod` | `'annual' \| 'month'` | `'annual'` | Default billing period |
| `showTrialBadge` | `boolean` | `true` | Show trial badge on cards |
| `trialDays` | `number` | `7` | Number of trial days to display |
| `showHeader` | `boolean` | `true` | Show section header |
| `headerTitle` | `string` | `'Choose Your Plan'` | Header title text |
| `headerSubtitle` | `string` | Auto | Header subtitle text |
| `showTrustBadges` | `boolean` | `true` | Show trust badges at bottom |
| `trustBadgeText` | `string` | Auto | Custom trust badge text |
| `maxWidth` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'xl'` | Container max width |
| `planDescriptions` | `object` | Auto | Override plan descriptions |

### PlanCardData Type

```typescript
interface PlanCardData {
  name: string;              // Plan name (e.g., "Starter", "Pro", "Enterprise")
  clerkPlanId: string;       // Clerk plan ID
  tier: 'bronze' | 'gold' | 'diamond';  // Internal tier name
  annualPrice: string;       // Annual price display (e.g., "$67")
  monthlyPrice: string;      // Monthly price display (e.g., "$89")
  description: string;       // Plan description
  features: string[];        // List of features
  limits: {
    maxLocations: number;
    maxPromotions: number;
    maxEvents: number;
  };
  highlighted: boolean;      // Show as "MOST POPULAR"
  isCustom: boolean;         // Enterprise/custom pricing plan
}
```

## Use Cases

### 1. Marketing Landing Page
- Full pricing table with all features
- "Start Free Trial" CTAs
- Annual/monthly toggle
- Trust badges

### 2. Checkout Flow
- Post-signup pricing selection
- Integration with Clerk CheckoutButton
- Trial information prominent
- Security messaging

### 3. Settings/Subscription Page
- Show current plan status
- "Switch Plan" / "Current Plan" CTAs
- No trial badges (already subscribed)
- Minimal trust messaging

### 4. Upgrade Prompts
- Compact version without header
- Focused on plan differences
- Direct "Upgrade" CTAs

### 5. Comparison Pages
- Side-by-side plan comparison
- Emphasize feature differences
- Educational focus

## Customization Examples

### Custom Button Text

```tsx
<PricingTable
  onPlanClick={handleClick}
  getButtonText={(plan) => {
    if (plan.isCustom) return 'Contact Our Team';
    if (plan.tier === 'gold') return 'Most Popular - Start Now';
    return 'Get Started';
  }}
/>
```

### Conditional Button States

```tsx
<PricingTable
  onPlanClick={handleClick}
  getButtonDisabled={(plan) => {
    // Disable if user already on this plan
    return currentPlan === plan.tier;
  }}
  getButtonVariant={(plan) => {
    // Highlight current plan
    return currentPlan === plan.tier ? 'contained' : 'outlined';
  }}
/>
```

### Custom Plan Descriptions

```tsx
<PricingTable
  onPlanClick={handleClick}
  planDescriptions={{
    starter: 'Perfect for restaurants just getting started',
    pro: 'Ideal for multi-location restaurant groups',
    enterprise: 'Custom solutions for large franchises'
  }}
/>
```

### Minimal Compact Version

```tsx
<PricingTable
  onPlanClick={handleClick}
  showHeader={false}
  showBillingToggle={false}
  showTrialBadge={false}
  showTrustBadges={false}
  maxWidth="md"
/>
```

## Data Flow

```
┌─────────────────────────────────────────┐
│  Convex Backend (Single Source of Truth)│
│  convex/constants/clerkPlans.ts         │
│  ├── Plan IDs                           │
│  ├── Pricing (fallback + Clerk API)    │
│  ├── Features                           │
│  └── Limits                             │
└──────────────────┬──────────────────────┘
                   │
                   │ api.clerkPlans.getPlans
                   │
                   ▼
┌─────────────────────────────────────────┐
│  PricingTable Component                 │
│  ├── Fetches plan data                  │
│  ├── Formats for display                │
│  ├── Handles user interaction           │
│  └── Renders pricing cards              │
└──────────────────┬──────────────────────┘
                   │
                   │ onPlanClick callback
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Parent Component                       │
│  ├── Handles navigation                 │
│  ├── Opens signup/checkout              │
│  └── Manages subscription changes       │
└─────────────────────────────────────────┘
```

## Styling

The component uses MUI (Material-UI) with custom styling that matches the JaxSaver brand:

- **Background**: Black (#000)
- **Accent**: Gold (#FCD34D)
- **Text**: White (#FFFFFF) / Gray (#9CA3AF)
- **Cards**: Dark gray (#0A0A0A) with subtle borders
- **Animations**: Framer Motion for smooth transitions

All styling is inline using MUI's `sx` prop for complete encapsulation.

## Accessibility

- ✅ Keyboard navigation support
- ✅ ARIA labels on interactive elements
- ✅ Semantic HTML structure
- ✅ High contrast ratios for text
- ✅ Focus indicators on buttons

## Performance

- ✅ Lazy loading with React.lazy (if needed)
- ✅ Memoized callbacks (via React Compiler)
- ✅ Optimized animations (GPU-accelerated)
- ✅ Single Convex query (efficient data fetching)

## Migration Guide

### From Existing PricingPreview Component

```tsx
// Before
import { PricingPreview } from '@/components/landing/PricingPreview';
<PricingPreview />

// After
import { PricingTable } from '@/components/pricing/PricingTable';
<PricingTable
  onPlanClick={(plan) => {
    if (plan.isCustom) navigate('/contact');
    else navigate(`/checkout?plan=${plan.clerkPlanId}`);
  }}
/>
```

### From CheckoutPage Inline Pricing

```tsx
// Before: Inline pricing cards in CheckoutPage
const plans = [/* ... */];
{plans.map(plan => <Paper>...</Paper>)}

// After: Use PricingTable component
<PricingTable
  onPlanClick={handlePlanClick}
  headerTitle="Choose Your Plan"
/>
```

## Examples

See `PricingTable.examples.tsx` for complete working examples of:
- Marketing site implementation
- Checkout page implementation
- Settings page implementation
- Compact preview implementation
- Custom descriptions implementation

## Support

For questions or issues with the PricingTable component:
1. Check the examples file (`PricingTable.examples.tsx`)
2. Review this README
3. Check the component source code for inline comments
4. Reach out to the development team

## Changelog

### v1.0.0 (2025-01-08)
- Initial release
- Supports Starter, Pro, and Enterprise plans
- Full customization via props
- Responsive design
- Framer Motion animations
- TypeScript support
