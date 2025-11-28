import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Button, Grid, Paper } from '@mui/material';
import { useClerk, useAuth } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { useNavigate } from 'react-router-dom';
import { useFeatureFlagPayload } from 'posthog-js/react';
import { api } from '../../../convex/_generated/api';
import { ArrowRight, Star, RefreshCw, Eye, Bookmark, DollarSign, UserPlus, Sparkles, Check, User } from 'lucide-react';
import { trackGetStartedClick } from '../../utils/marketingAnalytics';
import DashboardImage from '../../assets/Dashboard.png';
import MenuScrollGif from '../../assets/business-profile-menu-items-scroll.gif';
import UserSaveGif from '../../assets/user-save.gif';
import JaxSaverLogo from '../../assets/jaxsaver-glass-dark-solid-80.png';

// =============================================================================
// MOCKUP: Active Promotions Card
// =============================================================================
const ActivePromotionsMockup: React.FC = () => {
  const finalPromotions = [
    { title: 'Copy of $50 Off ...', views: 127, saves: 24, revenue: 450, customers: 12 },
    { title: 'Save $5 on Auto ...', views: 342, saves: 58, revenue: 890, customers: 31 },
    { title: '10% Off Repair O...', views: 458, saves: 86, revenue: 1250, customers: 47 },
  ];

  const [counts, setCounts] = useState(finalPromotions.map(() => ({ views: 0, saves: 0, revenue: 0, customers: 0 })));

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic

      setCounts(finalPromotions.map((promo) => ({
        views: Math.round(promo.views * eased),
        saves: Math.round(promo.saves * eased),
        revenue: Math.round(promo.revenue * eased),
        customers: Math.round(promo.customers * eased),
      })));

      if (step >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderRadius: '16px',
        p: 3,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box
          sx={{
            color: '#22c55e',
            animation: 'spin 8s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
        >
          <RefreshCw size={24} />
        </Box>
        <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
          3 Active Promotions
        </Typography>
      </Box>

      {/* Table Header */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '48px 1fr 48px 48px 48px 48px',
          gap: 1,
          mb: 2,
          px: 1,
        }}
      >
        <Box />
        <Box />
        <Box sx={{ display: 'flex', justifyContent: 'center', color: '#9ca3af' }}>
          <Eye size={18} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', color: '#9ca3af' }}>
          <Bookmark size={18} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', color: '#9ca3af' }}>
          <DollarSign size={18} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', color: '#9ca3af' }}>
          <UserPlus size={18} />
        </Box>
      </Box>

      {/* Rows */}
      {finalPromotions.map((promo, i) => (
        <Box
          key={i}
          sx={{
            display: 'grid',
            gridTemplateColumns: '48px 1fr 48px 48px 48px 48px',
            gap: 1,
            alignItems: 'center',
            py: 1.5,
            px: 1,
            borderTop: i > 0 ? '1px solid #f1f5f9' : 'none',
          }}
        >
          {/* Thumbnail placeholder */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '8px',
              bgcolor: '#e2e8f0',
            }}
          />
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#1e293b',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {promo.title}
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: '#9ca3af', textAlign: 'center' }}>
            {counts[i].views}
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: '#9ca3af', textAlign: 'center' }}>
            {counts[i].saves}
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: '#9ca3af', textAlign: 'center' }}>
            {counts[i].revenue}
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: '#9ca3af', textAlign: 'center' }}>
            {counts[i].customers}
          </Typography>
        </Box>
      ))}

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1e293b' }}>
          View Active Promotions
        </Typography>
      </Box>
    </Box>
  );
};

// =============================================================================
// MOCKUP: AI Builder Card
// =============================================================================
const AIBuilderMockup: React.FC = () => {
  const suggestions = [
    '20% Off Auto Repairs Today',
    'Save 20% on Car Service Now',
    'Exclusive 20% Off for You',
    'Fix It Right, Save 20%',
  ];

  const inputText = '20% Off Auto Repairs Today';
  const [visibleChars, setVisibleChars] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Typing animation for input field
    const duration = 1500;
    const interval = duration / inputText.length;
    let charCount = 0;

    const timer = setInterval(() => {
      charCount++;
      setVisibleChars(charCount);

      if (charCount >= inputText.length) {
        clearInterval(timer);
        // Show suggestions after typing completes
        setTimeout(() => setShowSuggestions(true), 300);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderRadius: '16px',
        p: 3,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }}
    >
      {/* Header */}
      <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', mb: 0.5, textAlign: 'center' }}>
        What should we call this promotion?
      </Typography>
      <Typography sx={{ fontSize: '0.8125rem', color: '#9ca3af', mb: 2, textAlign: 'center' }}>
        Create a catchy title that grabs attention
      </Typography>

      {/* Text Input Field */}
      <Box
        sx={{
          bgcolor: 'white',
          border: '1px solid',
          borderColor: '#e2e8f0',
          borderRadius: '12px',
          p: 2,
          mb: 3,
        }}
      >
        <Typography sx={{ fontSize: '1rem', color: '#1e293b', minHeight: 24 }}>
          {inputText.slice(0, visibleChars)}
          {visibleChars < inputText.length && (
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                width: 2,
                height: 16,
                bgcolor: '#fbbf24',
                ml: 0.25,
                verticalAlign: 'middle',
                animation: 'blink 0.8s infinite',
                '@keyframes blink': {
                  '0%, 50%': { opacity: 1 },
                  '51%, 100%': { opacity: 0 },
                },
              }}
            />
          )}
        </Typography>
      </Box>

      {/* Suggestions Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          mb: 2,
          opacity: showSuggestions ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1e293b' }}>
          Or choose from these suggestions:
        </Typography>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            bgcolor: 'white',
            border: '1px solid',
            borderColor: '#e2e8f0',
            borderRadius: '100px',
          }}
        >
          <Sparkles size={12} style={{ color: '#fbbf24' }} />
          <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 500 }}>
            AI Generated (Beta)
          </Typography>
        </Box>
      </Box>

      {/* Suggestion Pills - 2x2 Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1,
          opacity: showSuggestions ? 1 : 0,
          transform: showSuggestions ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.3s ease',
        }}
      >
        {suggestions.map((suggestion, i) => (
          <Box
            key={i}
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: '100px',
              border: '1px solid',
              borderColor: '#1e293b',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#1e293b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {suggestion}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// =============================================================================
// HERO SECTION - Matches Finta exactly
// =============================================================================
export const Hero: React.FC = () => {
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  // Query subscription to determine button state
  const directSubscription = useQuery(api.clerkBilling.getCurrentSubscription);
  const hasActiveSubscription = directSubscription?.hasSubscription &&
    (directSubscription?.status === 'active' || directSubscription?.status === 'trialing');

  // Dynamic time calculation
  const getReturnTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10);
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  };

  const [returnTime, setReturnTime] = useState(getReturnTime());

  // Get H1 heading from PostHog feature flag - editable in PostHog dashboard
  // Use | as line break marker in PostHog (e.g., "Local Customers|In A Few Clicks")
  const h1Payload = useFeatureFlagPayload('homepage-h1-test') as { heading?: string } | null;
  const rawHeading = h1Payload?.heading || 'Magically simplify|local marketing';
  const headingText = rawHeading.replace(/\|/g, '\n');

  useEffect(() => {
    const interval = setInterval(() => setReturnTime(getReturnTime()), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    // Track the click
    const userState = isSignedIn
      ? (hasActiveSubscription ? 'signed_in_with_sub' : 'signed_in_no_sub')
      : 'signed_out';
    trackGetStartedClick('hero', userState);

    if (isSignedIn && hasActiveSubscription) {
      navigate('/business/dashboard');
    } else {
      // Go to pricing page - users will sign up from there
      navigate('/pricing');
    }
  };

  // Determine button text
  const buttonText = isSignedIn
    ? (hasActiveSubscription ? 'Dashboard' : 'Complete Signup')
    : 'Get started';

  return (
    <Box
      component="section"
      sx={{
        pt: { xs: 16, md: 20 },
        pb: { xs: 4, md: 6 },
        background: 'linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <Container maxWidth={false} sx={{ maxWidth: 1136, mx: 'auto', px: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center' }}>
          {/* Plain black headline - no gradient */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.75rem', sm: '3.5rem', md: '4.25rem' },
              fontWeight: 700,
              color: '#1e293b',
              mb: 3,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              whiteSpace: 'pre-line', // Preserve line breaks from \n
            }}
          >
            {headingText}
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: '1.125rem', md: '1.25rem' },
              color: '#64748b',
              mb: 4,
              lineHeight: 1.6,
              maxWidth: 580,
              mx: 'auto',
            }}
          >
            Automated marketing, effortless AI-assisted builder, real-time insights. Set up in 10 mins. Back to work by {returnTime}.
          </Typography>

          {/* Get Started Button */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center', mb: 3 }}>
            <Button
              variant="contained"
              onClick={handleGetStarted}
              sx={{
                bgcolor: '#fbbf24',
                color: 'white',
                px: 3,
                py: 1.25,
                fontSize: '0.9375rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#f59e0b' },
              }}
            >
              {buttonText}
            </Button>
          </Box>

        </Box>
      </Container>

      {/* Dashboard Preview with gradient fade */}
      <Box
        sx={{
          maxWidth: 1136,
          mx: 'auto',
          mt: 6,
          px: { xs: 2, sm: 3 },
          WebkitMaskImage: 'radial-gradient(155.14% 111.78% at 50% -11.78%, #d9d9d9 60%, #73737300 90%)',
          maskImage: 'radial-gradient(155.14% 111.78% at 50% -11.78%, #d9d9d9 60%, #73737300 90%)',
        }}
      >
        <Box
          component="img"
          src={DashboardImage}
          alt="JaxSaver Dashboard"
          sx={{ width: '100%', display: 'block' }}
        />
      </Box>
    </Box>
  );
};

// =============================================================================
// LOGO BAR - With marquee animation
// =============================================================================
const logos = [
  { name: 'Magic Patterns', style: { fontFamily: 'system-ui', fontWeight: 600 } },
  { name: 'instant', style: { fontFamily: 'system-ui', fontWeight: 700 } },
  { name: 'Resend', style: { fontFamily: 'system-ui', fontWeight: 700 } },
  { name: 'Circleback.', style: { fontFamily: 'system-ui', fontWeight: 600 } },
  { name: 'outline', style: { fontFamily: 'system-ui', fontWeight: 500, fontStyle: 'italic' } },
  { name: 'rye', style: { fontFamily: 'system-ui', fontWeight: 700 } },
  { name: 'unthread', style: { fontFamily: 'system-ui', fontWeight: 500 } },
  { name: 'relay.app', style: { fontFamily: 'system-ui', fontWeight: 600 } },
];

export const LogoBar: React.FC = () => (
  <Box component="section" sx={{ py: { xs: 6, md: 8 }, bgcolor: 'white' }}>
    <Box sx={{ maxWidth: 1136, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      <Typography
        sx={{
          textAlign: 'center',
          color: '#64748b',
          mb: 4,
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
      >
        Trusted by fast-growing local businesses
      </Typography>

      {/* Marquee container with fade edges */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '100px',
            zIndex: 2,
            pointerEvents: 'none',
          },
          '&::before': {
            left: 0,
            background: 'linear-gradient(to right, white, transparent)',
          },
          '&::after': {
            right: 0,
            background: 'linear-gradient(to left, white, transparent)',
          },
        }}
      >
        {/* Scrolling track */}
        <Box
          sx={{
            display: 'flex',
            animation: 'marquee 30s linear infinite',
            '@keyframes marquee': {
              '0%': { transform: 'translateX(0)' },
              '100%': { transform: 'translateX(-50%)' },
            },
          }}
        >
          {/* Double the logos for seamless loop */}
          {[...logos, ...logos].map((logo, i) => (
            <Typography
              key={`${logo.name}-${i}`}
              sx={{
                fontSize: '1rem',
                color: '#1e293b',
                opacity: 0.5,
                whiteSpace: 'nowrap',
                px: 4,
                ...logo.style,
              }}
            >
              {logo.name}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  </Box>
);

// =============================================================================
// SECTION HEADER
// =============================================================================
interface SectionHeaderProps {
  title: string;
  highlight: string;
  subtitle: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, highlight, subtitle }) => (
  <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
    <Typography
      variant="h2"
      sx={{
        fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
        fontWeight: 700,
        color: '#1e293b',
        mb: 2,
        lineHeight: 1.2,
      }}
    >
      {title}{' '}
      <Box component="span" sx={{ color: '#fbbf24' }}>
        {highlight}
      </Box>
    </Typography>
    <Typography
      sx={{
        fontSize: { xs: '1rem', md: '1.125rem' },
        color: '#64748b',
        maxWidth: 600,
        mx: 'auto',
      }}
    >
      {subtitle}
    </Typography>
  </Box>
);

// =============================================================================
// FEATURE CARD WITH MOCKUP - Like Finta
// =============================================================================
interface FeatureCardProps {
  mockupSrc?: string;
  mockupComponent?: React.ReactNode;
  label: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ mockupSrc, mockupComponent, label, description }) => (
  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    {/* Mockup - either component or image */}
    <Box
      sx={{
        mb: 3,
        minHeight: 400,
        display: 'flex',
        alignItems: 'normal',
        justifyContent: 'center',
      }}
    >
      {mockupComponent ? (
        mockupComponent
      ) : (
        <Box
          component="img"
          src={mockupSrc}
          alt={label}
          sx={{ width: '100%', display: 'block', minHeight: 200 }}
        />
      )}
    </Box>
    {/* Label and description */}
    <Box sx={{ textAlign: 'center' }}>
      <Typography
        sx={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          color: '#fbbf24',
          letterSpacing: '0.1em',
          mb: 1.5,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.6 }}>
        {description}
      </Typography>
    </Box>
  </Box>
);

// =============================================================================
// FEATURE CARDS SECTION - First section
// =============================================================================
export const FeatureCardsSection: React.FC = () => (
  <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
    <Container maxWidth={false} sx={{ maxWidth: 1136, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      <SectionHeader
        title="Marketing success with"
        highlight="zero stress"
        subtitle="Expert tools and support for year-round peace of mind."
      />
      {/* Split layout card */}
      <Box
        sx={{
          bgcolor: 'white',
          border: '1px solid',
          borderColor: '#e2e8f0',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {/* Left card - Analytics */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 3, md: 5 },
              borderRight: { md: '1px solid #e2e8f0' },
              borderBottom: { xs: '1px solid #e2e8f0', md: 'none' },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
              <ActivePromotionsMockup />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#fbbf24',
                  letterSpacing: '0.1em',
                  mb: 1.5,
                }}
              >
                ALL ANALYTICS HANDLED
              </Typography>
              <Typography sx={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.6 }}>
                Track every impression, save, and redemption accurately and in real-time.
              </Typography>
            </Box>
          </Box>

          {/* Right card - AI Builder */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 3, md: 5 },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
              <AIBuilderMockup />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#fbbf24',
                  letterSpacing: '0.1em',
                  mb: 1.5,
                }}
              >
                AI-POWERED CREATION
              </Typography>
              <Typography sx={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.6 }}>
                Create promotions in minutes with AI. No marketing skills needed.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  </Box>
);

// =============================================================================
// BIG QUOTE
// =============================================================================
interface BigQuoteProps {
  quote: string;
  author?: string;
  role?: string;
}

export const BigQuote: React.FC<BigQuoteProps> = ({ quote, author, role }) => (
  <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f8fafc' }}>
    <Container maxWidth={false} sx={{ maxWidth: 1136, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          sx={{
            fontSize: { xs: '1.5rem', md: '2rem' },
            fontWeight: 500,
            color: '#1e293b',
            mb: author ? 4 : 0,
            lineHeight: 1.4,
          }}
        >
          "{quote}"
        </Typography>
        {author && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1e293b' }}>
              {author}
            </Typography>
            {role && (
              <Typography sx={{ fontSize: '0.8125rem', color: '#64748b' }}>
                {role}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Container>
  </Box>
);

// =============================================================================
// MOCKUP: Live Chat Card
// =============================================================================
const LiveChatMockup: React.FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 320 }}>
    {/* User message */}
    <Box sx={{ alignSelf: 'flex-end' }}>
      <Box
        sx={{
          bgcolor: '#1e293b',
          color: 'white',
          px: 3,
          py: 2,
          borderRadius: '16px 16px 4px 16px',
          fontSize: '0.875rem',
          lineHeight: 1.5,
        }}
      >
        I'm having trouble uploading my business logo
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
        <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>✓✓</Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>2:30PM</Typography>
      </Box>
    </Box>

    {/* Support reply */}
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
      <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#e2e8f0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <User size={18} style={{ color: '#64748b' }} />
      </Box>
      <Box>
        <Box
          sx={{
            bgcolor: '#f1f5f9',
            px: 3,
            py: 2,
            borderRadius: '16px 16px 16px 4px',
            fontSize: '0.875rem',
            lineHeight: 1.5,
            color: '#1e293b',
          }}
        >
          I can help with that! We support JPG and PNG up to 5MB. If it's still not working, I can upload it for you - just send it here.
        </Box>
        <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af', mt: 0.5 }}>
          Camrin from Jax Saver
        </Typography>
      </Box>
    </Box>
  </Box>
);

// =============================================================================
// MOCKUP: Knowledge Base Card
// =============================================================================
const KnowledgeBaseMockup: React.FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    {/* Message header */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#e2e8f0' }} />
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>Geoff Seboz</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>11:30AM</Typography>
        </Box>
        <Typography sx={{ fontSize: '0.8125rem', color: '#64748b' }}>
          How do I create a promotion that converts?
        </Typography>
      </Box>
    </Box>

    {/* Article preview */}
    <Box
      sx={{
        bgcolor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderBottom: '1px solid #e2e8f0' }}>
        <Box sx={{ width: 32, height: 32, bgcolor: '#fbbf24', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>📖</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b' }}>
            Promotion Best Practices Guide
          </Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: '#9ca3af' }}>PDF</Typography>
        </Box>
      </Box>
      <Box sx={{ p: 2, bgcolor: '#f8fafc' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>High-converting promotions</Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>Page 1</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>Image requirements</Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>Page 3</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>Timing strategies</Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>Page 5</Typography>
        </Box>
      </Box>
    </Box>
  </Box>
);

// =============================================================================
// SUPPORT FEATURES SECTION - Two column cards
// =============================================================================
export const SupportFeaturesSection: React.FC = () => (
  <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
    <Container maxWidth={false} sx={{ maxWidth: 1136, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      {/* Split layout card */}
      <Box
        sx={{
          bgcolor: 'white',
          border: '1px solid',
          borderColor: '#e2e8f0',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {/* Left card - Live Chat */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 3, md: 5 },
              borderRight: { md: '1px solid #e2e8f0' },
              borderBottom: { xs: '1px solid #e2e8f0', md: 'none' },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
              <LiveChatMockup />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ color: '#fbbf24' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  </svg>
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#fbbf24',
                    letterSpacing: '0.1em',
                  }}
                >
                  LIVE SUPPORT
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.6 }}>
                Get quick, personalized help from our team for any account or technical questions.
              </Typography>
            </Box>
          </Box>

          {/* Right card - Knowledge Base */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 3, md: 5 },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
              <KnowledgeBaseMockup />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ color: '#fbbf24' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#fbbf24',
                    letterSpacing: '0.1em',
                  }}
                >
                  EXPERT GUIDANCE
                </Typography>
                <Box
                  sx={{
                    bgcolor: '#f1f5f9',
                    color: '#64748b',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    px: 1,
                    py: 0.25,
                    borderRadius: '4px',
                    letterSpacing: '0.05em',
                  }}
                >
                  COMING SOON
                </Box>
              </Box>
              <Typography sx={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.6 }}>
                Access proven strategies and best practices to maximize your promotion performance.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  </Box>
);

// =============================================================================
// MOCKUP: Auto-Categorization Table
// =============================================================================
const AutoCategorizationMockup: React.FC = () => {
  const events = [
    {
      name: 'Car Care Clinic',
      description: 'Learn basic car maintenance tips',
      status: 'COMPLETED',
      statusColor: '#ef4444',
      schedule: 'Nov 3, 2025',
      views: 156,
      saves: 42,
      rsvps: '18 / 25',
    },
    {
      name: 'Summer BBQ Bash',
      description: 'Family-friendly cookout event',
      status: 'ACTIVE',
      statusColor: '#22c55e',
      schedule: 'Dec 15, 2025',
      views: 342,
      saves: 89,
      rsvps: '45 / 100',
    },
    {
      name: 'Wine Tasting Night',
      description: 'Sample local wines and cheeses',
      status: 'PENDING',
      statusColor: '#f59e0b',
      schedule: 'Jan 8, 2026',
      views: 0,
      saves: 0,
      rsvps: '0 / 30',
    },
    {
      name: 'Fitness Challenge',
      description: 'Join our 30-day fitness program',
      status: 'ACTIVE',
      statusColor: '#22c55e',
      schedule: 'Dec 1, 2025',
      views: 523,
      saves: 167,
      rsvps: '82 / 150',
    },
  ];

  return (
    <Box sx={{ bgcolor: 'white', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 90px 90px 50px 50px 60px',
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: '1px solid #e2e8f0',
          bgcolor: '#f8fafc',
        }}
      >
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b' }}>Event</Typography>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b' }}>Status</Typography>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b' }}>Schedule</Typography>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textAlign: 'center' }}>Views</Typography>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textAlign: 'center' }}>Saves</Typography>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textAlign: 'center' }}>RSVPs</Typography>
      </Box>
      {/* Rows */}
      {events.map((event, i) => (
        <Box
          key={i}
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 90px 90px 50px 50px 60px',
            gap: 1,
            alignItems: 'center',
            px: 2,
            py: 1.5,
            borderBottom: i < events.length - 1 ? '1px solid #e2e8f0' : 'none',
          }}
        >
          {/* Event info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '6px', bgcolor: '#e2e8f0', flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {event.name}
              </Typography>
              <Typography sx={{ fontSize: '0.6875rem', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {event.description}
              </Typography>
            </Box>
          </Box>
          {/* Status badge */}
          <Box
            sx={{
              display: 'inline-block',
              px: 1,
              py: 0.25,
              bgcolor: `${event.statusColor}15`,
              borderRadius: '4px',
              width: 'fit-content',
            }}
          >
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: event.statusColor, textTransform: 'uppercase' }}>
              {event.status}
            </Typography>
          </Box>
          {/* Schedule */}
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
            {event.schedule}
          </Typography>
          {/* Stats */}
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
            {event.views}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
            {event.saves}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: event.status === 'PENDING' ? '#9ca3af' : '#fbbf24', textAlign: 'center' }}>
            {event.rsvps}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// =============================================================================
// AUTOMATION SECTION - Second themed section
// =============================================================================
export const AutomationSection: React.FC = () => (
  <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
    <Container maxWidth={false} sx={{ maxWidth: 1136, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      <SectionHeader
        title="Marketing on"
        highlight="autopilot"
        subtitle="Your time as a business owner is valuable. Let JaxSaver handle the marketing while you focus on your business."
      />

      {/* Split layout card */}
      <Box
        sx={{
          bgcolor: 'white',
          border: '1px solid',
          borderColor: '#e2e8f0',
          borderRadius: '16px',
          p: { xs: 3, md: 5 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4,
          alignItems: 'center',
        }}
      >
        {/* Left side - Text */}
        <Box sx={{ flex: { md: '0 0 35%' }, maxWidth: { md: '35%' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Sparkles size={20} style={{ color: '#fbbf24' }} />
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#fbbf24',
                letterSpacing: '0.1em',
              }}
            >
              EVENT MANAGEMENT
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              fontWeight: 500,
              color: '#1e293b',
              lineHeight: 1.4,
            }}
          >
            Events are automatically tracked with views, saves, and RSVPs in real-time.
          </Typography>
        </Box>

        {/* Right side - Component */}
        <Box sx={{ flex: { md: '1' } }}>
          <AutoCategorizationMockup />
        </Box>
      </Box>
    </Container>
  </Box>
);

// =============================================================================
// MOCKUP: Auto-Schedule Card
// =============================================================================
const AutoScheduleMockup: React.FC = () => {
  const promotions = [
    {
      name: '20% Off Oil Change',
      description: 'First-time customer special',
      status: 'ACTIVE',
      statusColor: '#22c55e',
      schedule: 'Nov 1 - Dec 31',
      views: 458,
      saves: 86,
      customers: 47,
    },
    {
      name: 'BOGO Pizza Deal',
      description: 'Buy one get one free',
      status: 'PENDING',
      statusColor: '#f59e0b',
      schedule: 'Dec 15 - Jan 15',
      views: 0,
      saves: 0,
      customers: 0,
    },
    {
      name: 'Holiday Special',
      description: 'Save $50 on services',
      status: 'ACTIVE',
      statusColor: '#22c55e',
      schedule: 'Dec 1 - Dec 25',
      views: 342,
      saves: 58,
      customers: 31,
    },
    {
      name: 'New Year Promo',
      description: '15% off all items',
      status: 'PENDING',
      statusColor: '#f59e0b',
      schedule: 'Jan 1 - Jan 31',
      views: 0,
      saves: 0,
      customers: 0,
    },
  ];

  return (
    <Box sx={{ bgcolor: 'white', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 80px 100px 50px 50px 60px',
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: '1px solid #e2e8f0',
          bgcolor: '#f8fafc',
        }}
      >
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b' }}>Promotion</Typography>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b' }}>Status</Typography>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b' }}>Schedule</Typography>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textAlign: 'center' }}>Views</Typography>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textAlign: 'center' }}>Saves</Typography>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textAlign: 'center' }}>Customers</Typography>
      </Box>
      {/* Rows */}
      {promotions.map((promo, i) => (
        <Box
          key={i}
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 80px 100px 50px 50px 60px',
            gap: 1,
            alignItems: 'center',
            px: 2,
            py: 1.5,
            borderBottom: i < promotions.length - 1 ? '1px solid #e2e8f0' : 'none',
          }}
        >
          {/* Promotion info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '6px', bgcolor: '#e2e8f0', flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {promo.name}
              </Typography>
              <Typography sx={{ fontSize: '0.6875rem', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {promo.description}
              </Typography>
            </Box>
          </Box>
          {/* Status badge */}
          <Box
            sx={{
              display: 'inline-block',
              px: 1,
              py: 0.25,
              bgcolor: `${promo.statusColor}15`,
              borderRadius: '4px',
              width: 'fit-content',
            }}
          >
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: promo.statusColor, textTransform: 'uppercase' }}>
              {promo.status}
            </Typography>
          </Box>
          {/* Schedule */}
          <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
            {promo.schedule}
          </Typography>
          {/* Stats */}
          <Typography sx={{ fontSize: '0.75rem', color: promo.status === 'PENDING' ? '#9ca3af' : '#64748b', textAlign: 'center' }}>
            {promo.views}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: promo.status === 'PENDING' ? '#9ca3af' : '#64748b', textAlign: 'center' }}>
            {promo.saves}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: promo.status === 'PENDING' ? '#9ca3af' : '#fbbf24', textAlign: 'center' }}>
            {promo.customers}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// =============================================================================
// MOCKUP: Automation Rules Card
// =============================================================================
const AutomationRulesMockup: React.FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    {/* Rule condition */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ px: 2, py: 1, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Category</Typography>
      </Box>
      <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>is</Typography>
      <Box sx={{ px: 2, py: 1, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Food & Dining</Typography>
      </Box>
    </Box>

    {/* Plus icon */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontSize: '0.875rem', color: '#64748b' }}>+</Typography>
      </Box>
    </Box>

    {/* THEN SET label */}
    <Box sx={{ px: 2, py: 1, bgcolor: '#1e293b', borderRadius: '6px', display: 'inline-flex', alignSelf: 'flex-start' }}>
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: 'white', letterSpacing: '0.05em' }}>THEN SET</Typography>
    </Box>

    {/* Rule actions */}
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ px: 2, py: 1, bgcolor: '#fef3c7', borderRadius: '8px' }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#92400e' }}>Duration</Typography>
        </Box>
        <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>to</Typography>
        <Box sx={{ px: 2, py: 1, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>7 days</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ px: 2, py: 1, bgcolor: '#dcfce7', borderRadius: '8px' }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#166534' }}>Auto-renew</Typography>
        </Box>
        <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>to</Typography>
        <Box sx={{ px: 2, py: 1, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Enabled</Typography>
        </Box>
      </Box>
    </Box>
  </Box>
);

// =============================================================================
// AUTOMATION FEATURES SECTION - Two column cards
// =============================================================================
export const AutomationFeaturesSection: React.FC = () => (
  <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
    <Container maxWidth={false} sx={{ maxWidth: 1136, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      {/* Split layout card */}
      <Box
        sx={{
          bgcolor: 'white',
          border: '1px solid',
          borderColor: '#e2e8f0',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {/* Left card - Auto Schedule */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 3, md: 5 },
              borderRight: { md: '1px solid #e2e8f0' },
              borderBottom: { xs: '1px solid #e2e8f0', md: 'none' },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
              <AutoScheduleMockup />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <RefreshCw size={18} style={{ color: '#fbbf24' }} />
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#fbbf24',
                    letterSpacing: '0.1em',
                  }}
                >
                  AUTO-PUBLISH PROMOTIONS
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.6 }}>
                Schedule promotions in advance and they'll automatically go live on your chosen date.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  </Box>
);

// =============================================================================
// INSIGHTS SECTION - Third themed section
// =============================================================================
// =============================================================================
// MOCKUP: Real-Time Metrics Card
// =============================================================================
const RealTimeMetricsMockup: React.FC = () => (
  <Box
    sx={{
      bgcolor: 'white',
      borderRadius: '16px',
      p: 3,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    }}
  >
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
      {/* Active Promotions */}
      <Box
        sx={{
          bgcolor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          p: 2,
        }}
      >
        <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#16a34a', mb: 0.5 }}>
          3
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#475569' }}>
          Active Promotions
        </Typography>
      </Box>
      {/* Active Events */}
      <Box
        sx={{
          bgcolor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          p: 2,
        }}
      >
        <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#2563eb', mb: 0.5 }}>
          2
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#475569' }}>
          Active Events
        </Typography>
      </Box>
      {/* Followers */}
      <Box
        sx={{
          bgcolor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          p: 2,
        }}
      >
        <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#7c3aed', mb: 0.5 }}>
          128
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#475569' }}>
          Followers
        </Typography>
      </Box>
      {/* Total Redemptions */}
      <Box
        sx={{
          bgcolor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          p: 2,
        }}
      >
        <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b', mb: 0.5 }}>
          47
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#475569' }}>
          Total Redemptions
        </Typography>
      </Box>
    </Box>
  </Box>
);

// =============================================================================
// MOCKUP: Trend Analysis Table
// =============================================================================
const TrendAnalysisMockup: React.FC = () => {
  const data = [
    { name: 'Summer Sale', week1: 245, week2: 312, week3: 298, trend: 'up' },
    { name: 'Happy Hour', week1: 89, week2: 156, week3: 201, trend: 'up' },
    { name: 'BOGO Deal', week1: 178, week2: 145, week3: 132, trend: 'down' },
    { name: 'Flash Sale', week1: 56, week2: 78, week3: 45, trend: 'down' },
  ];

  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderRadius: '16px',
        p: 3,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }}
    >
      <Box sx={{ bgcolor: '#f8fafc', borderRadius: '8px', overflow: 'hidden' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 60px 60px 60px',
            gap: 1,
            p: 1.5,
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
            Promotion
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textAlign: 'center' }}>
            Wk 1
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textAlign: 'center' }}>
            Wk 2
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textAlign: 'center' }}>
            Wk 3
          </Typography>
        </Box>
        {/* Rows */}
        {data.map((row, i) => (
          <Box
            key={i}
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 60px 60px 60px',
              gap: 1,
              p: 1.5,
              borderBottom: i < data.length - 1 ? '1px solid #e2e8f0' : 'none',
              bgcolor: 'white',
            }}
          >
            <Typography sx={{ fontSize: '0.8125rem', color: '#1e293b' }}>
              {row.name}
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', textAlign: 'center' }}>
              {row.week1}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.8125rem',
                textAlign: 'center',
                color: row.trend === 'up' ? '#22c55e' : '#64748b',
              }}
            >
              {row.week2} {row.trend === 'up' && '↗'}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.8125rem',
                textAlign: 'center',
                color: row.trend === 'down' ? '#ef4444' : '#22c55e',
              }}
            >
              {row.week3} {row.trend === 'down' ? '↘' : '↗'}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export const InsightsSection: React.FC = () => (
  <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
    <Container maxWidth={false} sx={{ maxWidth: 1136, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      <SectionHeader
        title="Insights for"
        highlight="smarter decisions"
        subtitle="Real-time dashboards so you get answers and avoid surprises."
      />
      <Box
        sx={{
          bgcolor: 'white',
          border: '1px solid',
          borderColor: '#e2e8f0',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Left - Real-time metrics */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 3, md: 5 },
              borderRight: { md: '1px solid #e2e8f0' },
              borderBottom: { xs: '1px solid #e2e8f0', md: 'none' },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
              <RealTimeMetricsMockup />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#fbbf24',
                  letterSpacing: '0.1em',
                  mb: 1.5,
                }}
              >
                REAL-TIME METRICS
              </Typography>
              <Typography sx={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.6 }}>
                See impressions, saves, and redemptions with instant updates.
              </Typography>
            </Box>
          </Box>
          {/* Right - Trend analysis */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 3, md: 5 },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
              <TrendAnalysisMockup />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#fbbf24',
                  letterSpacing: '0.1em',
                  mb: 1.5,
                }}
              >
                TREND ANALYSIS
              </Typography>
              <Typography sx={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.6 }}>
                Track performance over time and identify what works best.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  </Box>
);

// =============================================================================
// MOCKUP: Reports Download Card
// =============================================================================
const ReportsDownloadMockup: React.FC = () => (
  <Box
    sx={{
      bgcolor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      overflow: 'hidden',
    }}
  >
    {/* Report header */}
    <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 32, height: 40, bgcolor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: '0.625rem', color: '#64748b' }}>CSV</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
            Performance Report
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
            All promotion metrics
          </Typography>
        </Box>
      </Box>
    </Box>

    {/* Metrics preview */}
    <Box sx={{ p: 2 }}>
      {['Impressions & Saves', 'Redemption Rates', 'Click Analytics'].map((item, i) => (
        <Box
          key={i}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            py: 0.75,
          }}
        >
          <Check size={12} style={{ color: '#10b981' }} />
          <Typography sx={{ fontSize: '0.8125rem', color: '#64748b' }}>
            {item}
          </Typography>
        </Box>
      ))}
    </Box>

    {/* Download button */}
    <Box
      sx={{
        px: 2,
        py: 1.5,
        bgcolor: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#64748b' }}>
        Download CSV
      </Typography>
      <ArrowRight size={14} style={{ color: '#64748b', transform: 'rotate(90deg)' }} />
    </Box>
  </Box>
);

// =============================================================================
// MOCKUP: Push Notification Card (iOS style)
// =============================================================================
const PushNotificationMockup: React.FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    {/* First notification */}
    <Box
      sx={{
        bgcolor: 'white',
        borderRadius: '16px',
        p: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box
          component="img"
          src={JaxSaverLogo}
          alt="Jax Saver"
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            flexShrink: 0,
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b' }}>Jax Saver</Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: '#9ca3af' }}>now</Typography>
          </Box>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1e293b', mb: 0.25 }}>
            New deal from River City Auto
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
            Save 20% on your next oil change! Limited time offer.
          </Typography>
        </Box>
      </Box>
    </Box>

    {/* Second notification */}
    <Box
      sx={{
        bgcolor: 'white',
        borderRadius: '16px',
        p: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        opacity: 0.7,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box
          component="img"
          src={JaxSaverLogo}
          alt="Jax Saver"
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            flexShrink: 0,
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b' }}>Jax Saver</Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: '#9ca3af' }}>2m ago</Typography>
          </Box>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1e293b', mb: 0.25 }}>
            Island Glass just posted
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
            Free windshield chip repair with any service!
          </Typography>
        </Box>
      </Box>
    </Box>
  </Box>
);

// =============================================================================
// REPORTING FEATURES SECTION - Two column cards
// =============================================================================
export const ReportingFeaturesSection: React.FC = () => (
  <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
    <Container maxWidth={false} sx={{ maxWidth: 1136, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      {/* Split layout card */}
      <Box
        sx={{
          bgcolor: 'white',
          border: '1px solid',
          borderColor: '#e2e8f0',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {/* Left card - Reports */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 3, md: 5 },
              borderRight: { md: '1px solid #e2e8f0' },
              borderBottom: { xs: '1px solid #e2e8f0', md: 'none' },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
              <ReportsDownloadMockup />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ color: '#fbbf24' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#fbbf24',
                    letterSpacing: '0.1em',
                  }}
                >
                  PERFORMANCE REPORTS
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.6 }}>
                Download ready-to-share reports with one click. Perfect for tracking ROI.
              </Typography>
            </Box>
          </Box>

          {/* Right card - Push Notifications */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 3, md: 5 },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
              <PushNotificationMockup />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ color: '#fbbf24' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#fbbf24',
                    letterSpacing: '0.1em',
                  }}
                >
                  PUSH NOTIFICATIONS
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.6 }}>
                Users get instant alerts on their phone when you post new promotions.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  </Box>
);

// =============================================================================
// MENU SHOWCASE SECTION - Business profile menu display
// =============================================================================

export const MenuShowcaseSection: React.FC = () => (
  <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
    <Container maxWidth={false} sx={{ maxWidth: 1136, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      {/* Split layout card */}
      <Box
        sx={{
          bgcolor: 'white',
          border: '1px solid',
          borderColor: '#e2e8f0',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {/* Left card - Menu Display */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 3, md: 5 },
              borderRight: { md: '1px solid #e2e8f0' },
              borderBottom: { xs: '1px solid #e2e8f0', md: 'none' },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
              <Box
                component="img"
                src={MenuScrollGif}
                alt="Business menu on mobile"
                sx={{
                  maxWidth: 280,
                  width: '100%',
                  height: 'auto',
                  borderRadius: '24px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                }}
              />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ color: '#fbbf24' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#fbbf24',
                    letterSpacing: '0.1em',
                  }}
                >
                  MOBILE MENU DISPLAY
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.6 }}>
                Your services and pricing displayed beautifully in our native app—where users actually spend their time. Easy to browse, easy to understand.
              </Typography>
            </Box>
          </Box>

          {/* Right card - Save for Redemption */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 3, md: 5 },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
              <Box
                component="img"
                src={UserSaveGif}
                alt="User saving promotion"
                sx={{
                  maxWidth: 280,
                  width: '100%',
                  height: 'auto',
                  borderRadius: '24px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                }}
              />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ color: '#fbbf24' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#fbbf24',
                    letterSpacing: '0.1em',
                  }}
                >
                  SAVE & REDEEM
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.6 }}>
                Users save your promotions with one tap. Ready to redeem when they visit your business.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  </Box>
);

// =============================================================================
// INTEGRATIONS - Upward arc with logos like Finta
// =============================================================================
// Social media SVG icons
const SocialIcons = {
  Nextdoor: () => (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="white">
      <path d="M12 3L4 9v12h5v-7h6v7h5V9l-8-6zm0 2.5L18 10v9h-2v-7H8v7H6v-9l6-4.5z"/>
    </svg>
  ),
  TikTok: () => (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="white">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  ),
  Instagram: () => (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="white">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  Facebook: () => (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="white">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  YouTube: () => (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="white">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="white">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  JaxSaver: () => (
    <img
      src="/jaxsaver-glass-dark-solid.png"
      alt="JaxSaver"
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  ),
};

const integrationLogos = [
  { name: 'Nextdoor', color: '#8ed500', bgColor: '#8ed500' },
  { name: 'TikTok', color: '#000000', bgColor: '#000000' },
  { name: 'Instagram', color: '#e4405f', bgColor: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' },
  { name: 'JaxSaver', color: '#fbbf24', bgColor: '#2d2d2d', isCenter: true },
  { name: 'Facebook', color: '#1877f2', bgColor: '#1877f2' },
  { name: 'YouTube', color: '#ff0000', bgColor: '#ff0000' },
  { name: 'X', color: '#000000', bgColor: '#000000' },
];

export const IntegrationsSection: React.FC = () => (
  <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f8fafc' }}>
    <Container maxWidth={false} sx={{ maxWidth: 1136, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      <SectionHeader
        title="Pull them into"
        highlight="your orbit"
        subtitle="We use a multiplatform approach to drive your local customers straight to Jax Saver from where they are."
      />

      {/* Solar system orbit - 3D perspective view */}
      <Box sx={{ position: 'relative', height: 200, mb: 6 }}>

        {/* Center JaxSaver logo - the sun */}
        {(() => {
          const centerLogo = integrationLogos.find(logo => logo.isCenter);
          if (!centerLogo) return null;
          const size = 80;
          const IconComponent = SocialIcons[centerLogo.name as keyof typeof SocialIcons];

          return (
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: size,
                height: size,
                borderRadius: '50%',
                bgcolor: 'white',
                border: '3px solid #fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(218, 165, 32, 0.3)',
                zIndex: 10,
              }}
            >
              <Box
                sx={{
                  width: size * 0.7,
                  height: size * 0.7,
                  borderRadius: '50%',
                  background: centerLogo.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 0,
                  overflow: 'hidden',
                }}
              >
                {IconComponent && <IconComponent />}
              </Box>
            </Box>
          );
        })()}

        {/* All 6 orbiting icons with varied radii for more randomness */}
        {integrationLogos.filter(logo => !logo.isCenter).map((logo, i) => {
          const size = 48;
          const IconComponent = SocialIcons[logo.name as keyof typeof SocialIcons];
          // Non-linear values for more organic, random feel
          const orbitConfigs = [
            { radiusX: 95, radiusY: 38, duration: 28, delay: 0 },
            { radiusX: 160, radiusY: 65, duration: 47, delay: -8 },
            { radiusX: 125, radiusY: 50, duration: 35, delay: -22 },
            { radiusX: 210, radiusY: 85, duration: 58, delay: -14 },
            { radiusX: 145, radiusY: 58, duration: 42, delay: -31 },
            { radiusX: 240, radiusY: 95, duration: 52, delay: -4 },
          ];
          const config = orbitConfigs[i];
          const radiusX = config.radiusX;
          const radiusY = config.radiusY;
          const duration = config.duration;

          // Pre-calculate cos/sin values for 24 points (every 15°)
          const cos15 = 0.966; const sin15 = 0.259;
          const cos30 = 0.866; const sin30 = 0.5;
          const cos45 = 0.707; const sin45 = 0.707;
          const cos60 = 0.5; const sin60 = 0.866;
          const cos75 = 0.259; const sin75 = 0.966;

          return (
            <Box
              key={logo.name}
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: size,
                height: size,
                marginLeft: `-${size/2}px`,
                marginTop: `-${size/2}px`,
                animation: `orbit${i} ${duration}s linear infinite`,
                animationDelay: `${config.delay}s`, // Varied start positions for randomness
                [`@keyframes orbit${i}`]: {
                  '0%': { translate: `${radiusX}px 0`, scale: '1', zIndex: 20 },
                  '4.17%': { translate: `${Math.round(radiusX * cos15)}px ${Math.round(radiusY * sin15)}px`, scale: `${(1 + sin15 * 0.4).toFixed(2)}`, zIndex: 20 },
                  '8.33%': { translate: `${Math.round(radiusX * cos30)}px ${Math.round(radiusY * sin30)}px`, scale: `${(1 + sin30 * 0.4).toFixed(2)}`, zIndex: 20 },
                  '12.5%': { translate: `${Math.round(radiusX * cos45)}px ${Math.round(radiusY * sin45)}px`, scale: `${(1 + sin45 * 0.4).toFixed(2)}`, zIndex: 20 },
                  '16.67%': { translate: `${Math.round(radiusX * cos60)}px ${Math.round(radiusY * sin60)}px`, scale: `${(1 + sin60 * 0.4).toFixed(2)}`, zIndex: 20 },
                  '20.83%': { translate: `${Math.round(radiusX * cos75)}px ${Math.round(radiusY * sin75)}px`, scale: `${(1 + sin75 * 0.4).toFixed(2)}`, zIndex: 20 },
                  '25%': { translate: `0 ${radiusY}px`, scale: '1.4', zIndex: 20 },
                  '29.17%': { translate: `${-Math.round(radiusX * cos75)}px ${Math.round(radiusY * sin75)}px`, scale: `${(1 + sin75 * 0.4).toFixed(2)}`, zIndex: 20 },
                  '33.33%': { translate: `${-Math.round(radiusX * cos60)}px ${Math.round(radiusY * sin60)}px`, scale: `${(1 + sin60 * 0.4).toFixed(2)}`, zIndex: 20 },
                  '37.5%': { translate: `${-Math.round(radiusX * cos45)}px ${Math.round(radiusY * sin45)}px`, scale: `${(1 + sin45 * 0.4).toFixed(2)}`, zIndex: 20 },
                  '41.67%': { translate: `${-Math.round(radiusX * cos30)}px ${Math.round(radiusY * sin30)}px`, scale: `${(1 + sin30 * 0.4).toFixed(2)}`, zIndex: 20 },
                  '45.83%': { translate: `${-Math.round(radiusX * cos15)}px ${Math.round(radiusY * sin15)}px`, scale: `${(1 + sin15 * 0.4).toFixed(2)}`, zIndex: 20 },
                  '49.9%': { zIndex: 20 },
                  '50%': { translate: `${-radiusX}px 0`, scale: '1', zIndex: 1 },
                  '54.17%': { translate: `${-Math.round(radiusX * cos15)}px ${-Math.round(radiusY * sin15)}px`, scale: `${(1 - sin15 * 0.4).toFixed(2)}`, zIndex: 1 },
                  '58.33%': { translate: `${-Math.round(radiusX * cos30)}px ${-Math.round(radiusY * sin30)}px`, scale: `${(1 - sin30 * 0.4).toFixed(2)}`, zIndex: 1 },
                  '62.5%': { translate: `${-Math.round(radiusX * cos45)}px ${-Math.round(radiusY * sin45)}px`, scale: `${(1 - sin45 * 0.4).toFixed(2)}`, zIndex: 1 },
                  '66.67%': { translate: `${-Math.round(radiusX * cos60)}px ${-Math.round(radiusY * sin60)}px`, scale: `${(1 - sin60 * 0.4).toFixed(2)}`, zIndex: 1 },
                  '70.83%': { translate: `${-Math.round(radiusX * cos75)}px ${-Math.round(radiusY * sin75)}px`, scale: `${(1 - sin75 * 0.4).toFixed(2)}`, zIndex: 1 },
                  '75%': { translate: `0 ${-radiusY}px`, scale: '0.6', zIndex: 1 },
                  '79.17%': { translate: `${Math.round(radiusX * cos75)}px ${-Math.round(radiusY * sin75)}px`, scale: `${(1 - sin75 * 0.4).toFixed(2)}`, zIndex: 1 },
                  '83.33%': { translate: `${Math.round(radiusX * cos60)}px ${-Math.round(radiusY * sin60)}px`, scale: `${(1 - sin60 * 0.4).toFixed(2)}`, zIndex: 1 },
                  '87.5%': { translate: `${Math.round(radiusX * cos45)}px ${-Math.round(radiusY * sin45)}px`, scale: `${(1 - sin45 * 0.4).toFixed(2)}`, zIndex: 1 },
                  '91.67%': { translate: `${Math.round(radiusX * cos30)}px ${-Math.round(radiusY * sin30)}px`, scale: `${(1 - sin30 * 0.4).toFixed(2)}`, zIndex: 1 },
                  '95.83%': { translate: `${Math.round(radiusX * cos15)}px ${-Math.round(radiusY * sin15)}px`, scale: `${(1 - sin15 * 0.4).toFixed(2)}`, zIndex: 1 },
                  '99.9%': { zIndex: 1 },
                  '100%': { translate: `${radiusX}px 0`, scale: '1', zIndex: 20 },
                },
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  bgcolor: 'white',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              >
                <Box
                  sx={{
                    width: size * 0.6,
                    height: size * 0.6,
                    borderRadius: '50%',
                    background: logo.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 0.75,
                    overflow: 'hidden',
                  }}
                >
                  {IconComponent && <IconComponent />}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Testimonial below */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ fontSize: '0.9375rem', color: '#64748b', mb: 3, fontStyle: 'italic', maxWidth: 600, mx: 'auto' }}>
          "The Jax Saver app is such a cool way for me to find local stores and promotions I wouldn't have found otherwise."
        </Typography>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>Brittany Halstead</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Jax Saver App User</Typography>
        </Box>
      </Box>
    </Container>
  </Box>
);

// =============================================================================
// TESTIMONIALS GRID - Masonry with rating badge
// =============================================================================
const testimonials = [
  { quote: 'Super easy onboarding! Saving us money compared to social ads.', author: 'Sarah M.', role: 'Owner at Local Cafe' },
  { quote: 'Set up in 10 minutes. Already seeing new customers from our first promotion.', author: 'Mike R.', role: 'Owner at Auto Shop' },
  { quote: 'Marketing that actually reaches local people. No more wasted ad spend.', author: 'Jennifer L.', role: 'Owner at Boutique' },
  { quote: 'The analytics alone are worth it. I can see exactly what works.', author: 'David K.', role: 'Owner at Restaurant' },
  { quote: 'No more competing with viral cat videos. My customers actually see my promotions now.', author: 'Lisa T.', role: 'Owner at Salon' },
  { quote: 'Got onboarded in less than 5 minutes. Andy was super helpful and responsive throughout!', author: 'Tom H.', role: 'Owner at Gym' },
];

// TODO: Temporarily hidden - will update later
export const TestimonialsGrid: React.FC = () => null;

// =============================================================================
// FINAL CTA - Dark with geometric lines
// =============================================================================
export const FinalCTA: React.FC = () => {
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  // Query subscription to determine button state
  const directSubscription = useQuery(api.clerkBilling.getCurrentSubscription);
  const hasActiveSubscription = directSubscription?.hasSubscription &&
    (directSubscription?.status === 'active' || directSubscription?.status === 'trialing');

  const getReturnTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10);
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  };

  const [returnTime, setReturnTime] = useState(getReturnTime());

  useEffect(() => {
    const interval = setInterval(() => setReturnTime(getReturnTime()), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    // Track the click
    const userState = isSignedIn
      ? (hasActiveSubscription ? 'signed_in_with_sub' : 'signed_in_no_sub')
      : 'signed_out';
    trackGetStartedClick('final_cta', userState);

    if (isSignedIn && hasActiveSubscription) {
      navigate('/business/dashboard');
    } else if (isSignedIn) {
      // Signed in but no subscription - go to pricing page
      navigate('/pricing');
    } else {
      // Not signed in - open sign up then redirect to pricing
      clerk.openSignUp({ redirectUrl: '/pricing' });
    }
  };

  // Determine button text
  const buttonText = isSignedIn
    ? (hasActiveSubscription ? 'Dashboard' : 'Complete Signup')
    : 'Get started';

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 10, md: 14 },
        bgcolor: '#f8fafc',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Geometric line decorations */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          backgroundImage: `
            linear-gradient(135deg, transparent 40%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.3) 41%, transparent 41%),
            linear-gradient(225deg, transparent 40%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.3) 41%, transparent 41%)
          `,
          backgroundSize: '100% 100%',
        }}
      />

      <Container maxWidth={false} sx={{ maxWidth: 1136, mx: 'auto', px: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 700,
              mb: 1,
              lineHeight: 1.2,
              color: '#1e293b',
            }}
          >
            Set up in 10 mins.
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              fontWeight: 500,
              color: '#64748b',
              mb: 3,
            }}
          >
            Back to work by {returnTime}.
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: '#64748b', mb: 5 }}>
            Built for business owners who want to focus on their business, not their marketing.
          </Typography>
          <Button
            variant="contained"
            onClick={handleGetStarted}
            sx={{
              bgcolor: '#fbbf24',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': { bgcolor: '#f59e0b' },
            }}
          >
            {buttonText}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

// =============================================================================
// FOOTER - Two row layout with socials
// =============================================================================
export const Footer: React.FC = () => (
  <Box component="footer" sx={{ py: 4, bgcolor: 'white' }}>
    <Container maxWidth={false} sx={{ maxWidth: 1136, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      {/* Row 1: Logo + tagline | Social icons */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'center', sm: 'center' },
          gap: 2,
          mb: 3,
          pb: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Logo placeholder */}
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ color: '#1e293b', fontWeight: 700, fontSize: '0.875rem' }}>J</Typography>
          </Box>
          <Typography sx={{ fontSize: '0.875rem', color: '#64748b' }}>
            Magically simplify local marketing.
          </Typography>
        </Box>

        {/* Social icons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box
            component="a"
            href="#"
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              textDecoration: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              '&:hover': { bgcolor: '#e2e8f0' },
            }}
          >
            X
          </Box>
          <Box
            component="a"
            href="#"
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1e293b',
              textDecoration: 'none',
              fontSize: '0.625rem',
              fontWeight: 700,
              '&:hover': { bgcolor: '#d1d5db' },
            }}
          >
            in
          </Box>
        </Box>
      </Box>

      {/* Row 2: Copyright | Links */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography sx={{ fontSize: '0.8125rem', color: '#64748b' }}>
          Copyright © JaxSaver. All rights reserved.
        </Typography>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Typography
            component="a"
            href="/terms"
            sx={{
              fontSize: '0.8125rem',
              color: '#64748b',
              textDecoration: 'none',
              '&:hover': { color: '#1e293b' },
            }}
          >
            Terms and conditions
          </Typography>
          <Typography
            component="a"
            href="/privacy"
            sx={{
              fontSize: '0.8125rem',
              color: '#64748b',
              textDecoration: 'none',
              '&:hover': { color: '#1e293b' },
            }}
          >
            Privacy policy
          </Typography>
        </Box>
      </Box>
    </Container>
  </Box>
);

// =============================================================================
// LEGACY EXPORTS (for backward compatibility)
// =============================================================================
export const FeatureBlock = FeatureCard;
export const FAQ = () => null; // Removed - Finta doesn't have FAQ on main page
