import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress
} from '@mui/material';
import { Check, ArrowRight } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';

/**
 * PricingTable Component - Reusable pricing display
 *
 * Features:
 * - Fetches plan data from Convex (single source of truth)
 * - Supports annual/monthly billing toggle
 * - Customizable CTAs via callback props
 * - Consistent styling across app and marketing site
 * - Responsive design with mobile optimization
 */

export interface PricingTableProps {
  /** Callback when user clicks a plan CTA button - receives plan and current billing period */
  onPlanClick: (plan: PlanCardData, billingPeriod: 'annual' | 'month') => void;

  /** Optional: Override button text for specific plans */
  getButtonText?: (plan: PlanCardData) => string;

  /** Optional: Determine if button should be disabled */
  getButtonDisabled?: (plan: PlanCardData) => boolean;

  /** Optional: Get button variant (contained or outlined) */
  getButtonVariant?: (plan: PlanCardData) => 'contained' | 'outlined';

  /** Optional: Show/hide annual toggle (default: true) */
  showBillingToggle?: boolean;

  /** Optional: Default billing period (default: 'annual') */
  defaultBillingPeriod?: 'annual' | 'month';

  /** Optional: Show/hide trial badges (default: true) */
  showTrialBadge?: boolean;

  /** Optional: Trial days to display (default: 7) */
  trialDays?: number;

  /** Optional: Show section header (default: true) */
  showHeader?: boolean;

  /** Optional: Custom header title */
  headerTitle?: string;

  /** Optional: Custom header subtitle */
  headerSubtitle?: string;

  /** Optional: Show trust badges at bottom (default: true) */
  showTrustBadges?: boolean;

  /** Optional: Custom trust badge text */
  trustBadgeText?: string;

  /** Optional: Container max width (default: 'xl') */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';

  /** Optional: Add custom plan descriptions */
  planDescriptions?: {
    essential?: string;
    starter?: string;
    pro?: string;
    business?: string;
  };

  /** Optional: Custom button renderer - if provided, uses custom buttons instead of default */
  renderButton?: (plan: PlanCardData, billingPeriod: 'annual' | 'month') => React.ReactNode;
}

export interface PlanCardData {
  name: string;
  clerkPlanId: string;
  tier: 'essential' | 'starter' | 'pro' | 'business';
  annualPrice: string;
  monthlyPrice: string;
  description: string;
  features: string[];
  limits: {
    maxLocations: number;
    maxPromotions: number;
    maxEvents: number;
  };
  highlighted: boolean;
  isCustom: boolean;
}

export const PricingTable: React.FC<PricingTableProps> = ({
  onPlanClick,
  getButtonText,
  getButtonDisabled,
  getButtonVariant,
  showBillingToggle = true,
  defaultBillingPeriod = 'annual',
  showTrialBadge = true,
  trialDays = 7,
  showHeader = true,
  headerTitle = 'Choose Your Plan',
  headerSubtitle = 'Start your 7-day free trial. Cancel anytime.',
  showTrustBadges = true,
  trustBadgeText = '🔒 Secure payment processing • Cancel anytime • Full access during trial',
  maxWidth = 'xl',
  planDescriptions = {},
  renderButton,
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'annual' | 'month'>(defaultBillingPeriod);

  // Fetch plan details from Convex (single source of truth)
  const planDetails = useQuery(api.clerkPlans.getPlans);

  // Stale-while-revalidate: refresh if cache is old
  const refreshIfStale = useMutation(api.clerkPlans.refreshIfStale);
  useEffect(() => {
    refreshIfStale();
  }, [refreshIfStale]);

  // Helper function to format price from cents to dollars
  const formatPrice = (priceInCents: number): string => {
    if (priceInCents === 0) return 'Contact Us';
    const dollars = priceInCents / 100;
    return `$${dollars.toFixed(0)}`;
  };

  // Show loading state
  if (!planDetails) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress sx={{ color: '#FCD34D' }} />
      </Box>
    );
  }

  // Safety check for missing plans
  if (!planDetails.essential || !planDetails.starter || !planDetails.pro || !planDetails.business) {
    console.error('[PricingTable] Missing plan data:', {
      essential: !!planDetails.essential,
      starter: !!planDetails.starter,
      pro: !!planDetails.pro,
      business: !!planDetails.business,
    });
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress sx={{ color: '#FCD34D' }} />
      </Box>
    );
  }

  // Map Convex plan details to component format
  const plans: PlanCardData[] = [
    {
      name: planDetails.essential.name,
      clerkPlanId: planDetails.essential.id,
      tier: 'essential' as const,
      annualPrice: planDetails.essential.priceDisplay,
      monthlyPrice: formatPrice(planDetails.essential.price),
      description: planDescriptions.essential || planDetails.essential.description || 'Just getting started',
      features: planDetails.essential.features,
      limits: planDetails.essential.limits,
      highlighted: false,
      isCustom: false,
    },
    {
      name: planDetails.starter.name,
      clerkPlanId: planDetails.starter.id,
      tier: 'starter' as const,
      annualPrice: planDetails.starter.priceDisplay,
      monthlyPrice: formatPrice(planDetails.starter.price),
      description: planDescriptions.starter || planDetails.starter.description || 'Ready to grow',
      features: planDetails.starter.features,
      limits: planDetails.starter.limits,
      highlighted: false,
      isCustom: false,
    },
    {
      name: planDetails.pro.name,
      clerkPlanId: planDetails.pro.id,
      tier: 'pro' as const,
      annualPrice: planDetails.pro.priceDisplay,
      monthlyPrice: formatPrice(planDetails.pro.price),
      description: planDescriptions.pro || planDetails.pro.description || 'Scale your reach',
      features: planDetails.pro.features,
      limits: planDetails.pro.limits,
      highlighted: true,
      isCustom: false,
    },
    {
      name: planDetails.business.name,
      clerkPlanId: planDetails.business.id,
      tier: 'business' as const,
      annualPrice: planDetails.business.priceDisplay,
      monthlyPrice: formatPrice(planDetails.business.price),
      description: planDescriptions.business || planDetails.business.description || 'Maximum visibility',
      features: planDetails.business.features,
      limits: planDetails.business.limits,
      highlighted: false,
      isCustom: false,
    },
  ];

  // Default button text generator
  const defaultGetButtonText = (plan: PlanCardData): string => {
    if (plan.isCustom) return 'Contact Sales';
    return 'Start Free Trial';
  };

  // Default button variant generator
  const defaultGetButtonVariant = (plan: PlanCardData): 'contained' | 'outlined' => {
    return plan.highlighted ? 'contained' : 'outlined';
  };

  // Default button disabled state
  const defaultGetButtonDisabled = (): boolean => false;

  // Generate random stars for background animation
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${3 + Math.random() * 2}s`
  }));

  return (
    <>
      {/* Full-Width Founders Pricing Banner with Web 3.0 Purple Gradient */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 6, md: 8 },
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1a0033 0%, #0a0015 50%, #1a0033 100%)',
          borderTop: '1px solid rgba(147, 51, 234, 0.3)',
          borderBottom: '1px solid rgba(147, 51, 234, 0.3)',
        }}
      >
        {/* Animated Stars Background */}
        {stars.map((star) => (
          <Box
            key={star.id}
            component={motion.div}
            animate={{
              y: [-20, 20],
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: parseFloat(star.animationDuration),
              repeat: Infinity,
              ease: "easeInOut",
              delay: parseFloat(star.animationDelay)
            }}
            sx={{
              position: 'absolute',
              left: star.left,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #FCD34D 0%, rgba(252, 211, 77, 0) 70%)',
              boxShadow: '0 0 10px #FCD34D, 0 0 20px #FCD34D',
              pointerEvents: 'none'
            }}
          />
        ))}

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5.5rem' },
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 25%, #EC4899 50%, #8B5CF6 75%, #FCD34D 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradient 3s linear infinite',
                  textShadow: '0 0 40px rgba(252, 211, 77, 0.5)',
                  letterSpacing: '-0.02em',
                  mb: 2,
                  '@keyframes gradient': {
                    '0%': { backgroundPosition: '0% center' },
                    '100%': { backgroundPosition: '200% center' }
                  }
                }}
              >
                FOUNDERS PRICING
              </Typography>
            </motion.div>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                  fontWeight: 600,
                  color: '#FCD34D',
                  mb: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}
              >
                Limited Time Only • Lock In Forever 🔒
              </Typography>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                  color: '#D1D5DB',
                  fontWeight: 500,
                  maxWidth: 800,
                  mx: 'auto',
                  mb: 1
                }}
              >
                Sign up now and lock in these incredible rates forever.
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                  color: '#D1D5DB',
                  fontWeight: 500,
                  maxWidth: 800,
                  mx: 'auto'
                }}
              >
                Secure your lifetime discount today! 🚀
              </Typography>
            </motion.div>
          </Box>
        </Container>

        {/* Gradient Overlay Borders */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, #FCD34D 50%, transparent 100%)',
            opacity: 0.8
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, #8B5CF6 50%, transparent 100%)',
            opacity: 0.8
          }}
        />
      </Box>

      {/* Pricing Section */}
      <Box
        component={motion.section}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: 'white',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth={maxWidth}>

        {/* Header Section */}
        {showHeader && (
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 700,
                color: '#1e293b',
                mb: 2
              }}
            >
              {headerTitle.split(' ').slice(0, -1).join(' ')}{' '}
              <Box component="span" sx={{ color: '#fbbf24' }}>
                {headerTitle.split(' ').slice(-1)[0]}
              </Box>
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1rem', md: '1.25rem' },
                color: '#64748b',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              {headerSubtitle}
            </Typography>
          </Box>
        )}

        {/* Billing Period Toggle - Shown independently */}
        {showBillingToggle && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: { xs: 6, md: 10 } }}>
            <ToggleButtonGroup
              value={billingPeriod}
              exclusive
              onChange={(_, value) => value && setBillingPeriod(value)}
              sx={{
                bgcolor: '#F9FAFB',
                borderRadius: 3,
                p: 1,
                border: '2px solid #D1D5DB',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: 2,
                  px: { xs: 3, md: 4 },
                  py: { xs: 0.75, md: 0.75 },
                  color: '#64748b',
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  bgcolor: 'transparent',
                  transition: 'all 0.3s ease',
                  minWidth: { xs: '120px', md: '150px' },
                  lineHeight: 1.2,
                  '&.Mui-selected': {
                    bgcolor: '#fbbf24',
                    color: '#000',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(218, 165, 32, 0.4)',
                    transform: 'scale(1.02)',
                    '&:hover': {
                      bgcolor: '#C4941D',
                      transform: 'scale(1.02)',
                    }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(218, 165, 32, 0.1)',
                    color: '#fbbf24',
                  }
                }
              }}
            >
              <ToggleButton value="month">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box>Monthly</Box>
                </Box>
              </ToggleButton>
              <ToggleButton value="annual">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box>Annual</Box>
                  <Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 600, color: billingPeriod === 'annual' ? '#000' : '#10B981' }}>
                    Save 20%
                  </Box>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        {/* Pricing Cards - 4-up on desktop with flexbox */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'center',
          }}
        >
          {plans.map((plan, index) => (
            <Box
              key={plan.name}
              sx={{
                flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 0' },
                maxWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: 'none' },
                minWidth: { md: 0 },
              }}
            >
              <Paper
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{
                  p: { xs: 3, md: 3 },
                  bgcolor: 'white',
                  border: plan.highlighted ? '2px solid #fbbf24' : '1px solid #E5E7EB',
                  borderRadius: 3,
                  boxShadow: plan.highlighted ? '0 20px 60px rgba(218, 165, 32, 0.2)' : '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: plan.highlighted ? '0 25px 70px rgba(218, 165, 32, 0.2)' : '0 20px 40px rgba(218, 165, 32, 0.1)',
                  },
                }}
              >
                {/* Founders Pricing Badge - Rainbow gradient on all paid plans */}
                {!plan.isCustom ? (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #EC4899 100%)',
                      color: '#000',
                      px: 1.5,
                      py: 0.25,
                      borderRadius: 1.5,
                      fontSize: '0.65rem',
                      fontWeight: 900,
                      boxShadow: '0 0 20px rgba(252, 211, 77, 0.6)',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    FOUNDERS PRICING
                  </Box>
                ) : plan.highlighted && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bgcolor: '#FCD34D',
                      color: '#000',
                      px: 1.5,
                      py: 0.25,
                      borderRadius: 1.5,
                      fontSize: '0.65rem',
                      fontWeight: 900,
                      border: '2px solid #F59E0B',
                      boxShadow: '0 4px 12px rgba(252, 211, 77, 0.4)'
                    }}
                  >
                    MOST POPULAR
                  </Box>
                )}

                {/* Plan Name */}
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: '1.25rem', md: '1.125rem' },
                    fontWeight: 700,
                    color: '#1e293b',
                    mb: 0.5
                  }}
                >
                  {plan.name}
                </Typography>

                {/* Description */}
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    mb: 1.5,
                    fontSize: '0.75rem',
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                  }}
                >
                  {plan.description}
                </Typography>

                {/* Pricing - Founders Pricing */}
                <Box sx={{ mb: 2 }}>
                  <Box>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: { xs: '2rem', sm: '2.25rem', md: '2.5rem' },
                        fontWeight: 700,
                        color: '#1e293b'
                      }}
                    >
                      {billingPeriod === 'annual' ? plan.annualPrice : plan.monthlyPrice}
                    </Typography>
                    {plan.monthlyPrice !== 'Contact Us' && (
                      <Typography
                        component="span"
                        sx={{
                          fontSize: { xs: '0.875rem', md: '1rem' },
                          color: '#64748b',
                          ml: 0.5,
                          fontWeight: 600
                        }}
                      >
                        /mo
                      </Typography>
                    )}
                  </Box>
                  {!plan.isCustom && billingPeriod === 'annual' && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        color: '#64748b',
                        fontSize: '0.7rem',
                        mt: 0.25,
                        fontWeight: 500
                      }}
                    >
                      billed annually
                    </Typography>
                  )}
                </Box>

                {/* Features List */}
                <List sx={{ mb: 2, flexGrow: 1, py: 0 }}>
                  {plan.features
                    .filter(feature => !feature.toLowerCase().includes('newsletter'))
                    .map((feature, idx) => (
                    <ListItem key={`${feature}-${idx}`} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 22 }}>
                        <Check size={14} color="#10B981" />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: '#64748b',
                            fontSize: '0.75rem',
                            lineHeight: 1.3
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>

                {/* CTA Button */}
                {renderButton ? (
                  renderButton(plan, billingPeriod)
                ) : (
                  <Button
                    variant={(getButtonVariant || defaultGetButtonVariant)(plan)}
                    fullWidth
                    disabled={(getButtonDisabled || defaultGetButtonDisabled)(plan)}
                    endIcon={<ArrowRight size={16} />}
                    onClick={() => onPlanClick(plan, billingPeriod)}
                    sx={{
                      py: 1.25,
                      fontSize: { xs: '0.875rem', md: '0.875rem' },
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 2,
                      ...((getButtonVariant || defaultGetButtonVariant)(plan) === 'contained' ? {
                        bgcolor: '#1e293b',
                        color: '#FFFFFF',
                        '&:hover': {
                          bgcolor: '#1e293b',
                          boxShadow: '0 8px 30px rgba(218, 165, 32, 0.6)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      } : {
                        borderColor: '#1e293b',
                        color: '#1e293b',
                        borderWidth: 2,
                        '&:hover': {
                          borderColor: '#fbbf24',
                          color: '#fbbf24',
                          bgcolor: 'rgba(218, 165, 32, 0.1)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      })
                    }}
                  >
                    {(getButtonText || defaultGetButtonText)(plan)}
                  </Button>
                )}

                {/* Trial Badge - Below Button */}
                {showTrialBadge && !plan.isCustom && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      textAlign: 'center',
                      color: '#10B981',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      mt: 1
                    }}
                  >
                    {trialDays}-day free trial
                  </Typography>
                )}
              </Paper>
            </Box>
          ))}
        </Box>

        {/* Trust Badges */}
        {showTrustBadges && (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                fontSize: '0.875rem'
              }}
            >
              {trustBadgeText}
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
    </>
  );
};

export default PricingTable;
