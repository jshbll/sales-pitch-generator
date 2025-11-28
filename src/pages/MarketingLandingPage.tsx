import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
// All Grid layouts converted to Flexbox for consistent horizontal alignment
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Storefront as StorefrontIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon,
  Restaurant as RestaurantIcon,
  LocalOffer as LocalOfferIcon,
  Event as EventIcon,
  BarChart as BarChartIcon,
  Phone as PhoneIcon,
  Directions as DirectionsIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Language as LanguageIcon,
  Star as StarIcon,
  LocationOn as LocationOnIcon,
  Schedule as ScheduleIcon,
  Pause as PauseIcon,
  Campaign as CampaignIcon,
  NotificationsActive as NotificationsActiveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const MarketingLandingPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedFaq, setExpandedFaq] = useState<string | false>(false);
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [activeConnectSlide, setActiveConnectSlide] = useState<number>(0);

  // Refs for sticky positioning debugging
  const stickyOuterBoxRef = useRef<HTMLDivElement>(null);
  const stickyContainerRef = useRef<HTMLDivElement>(null);
  const stickyFlexBoxRef = useRef<HTMLDivElement>(null);
  const stickyLeftBoxRef = useRef<HTMLDivElement>(null);
  const stickyInnerBoxRef = useRef<HTMLDivElement>(null);

  // State for dynamic sticky positioning (fixed vs absolute)
  const [stickyPosition, setStickyPosition] = useState<'static' | 'fixed' | 'absolute'>('static');
  const [stickyWidth, setStickyWidth] = useState<number>(0);
  const [stickyTopPosition, setStickyTopPosition] = useState<string>('0');

  // Refs and state for right-side card fade effects
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [cardOpacities, setCardOpacities] = useState<number[]>([0.5, 0.5, 0.5]); // Start at 0.5 opacity

  // Auto-play slides every 5 seconds for "Take Charge" section
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3); // Cycle through 0, 1, 2
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Auto-play slides every 5 seconds for "Connect with Customers" section
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveConnectSlide((prev) => (prev + 1) % 3); // Cycle through 0, 1, 2
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // DEBUG: Log computed styles for sticky positioning
  useEffect(() => {
    const logStyles = () => {
      console.log('═══════════════════════════════════════════════════════');
      console.log('🔍 STICKY POSITIONING DEBUG');
      console.log('═══════════════════════════════════════════════════════');

      if (stickyOuterBoxRef.current) {
        const computed = window.getComputedStyle(stickyOuterBoxRef.current);
        console.log('📦 OUTER BOX (Section Container):');
        console.log('  position:', computed.position);
        console.log('  overflow:', computed.overflow);
        console.log('  overflow-x:', computed.overflowX);
        console.log('  overflow-y:', computed.overflowY);
        console.log('  height:', computed.height);
      }

      if (stickyContainerRef.current) {
        const computed = window.getComputedStyle(stickyContainerRef.current);
        console.log('📦 CONTAINER (MUI Container):');
        console.log('  position:', computed.position);
        console.log('  overflow:', computed.overflow);
        console.log('  height:', computed.height);
      }

      if (stickyFlexBoxRef.current) {
        const computed = window.getComputedStyle(stickyFlexBoxRef.current);
        console.log('📦 FLEX CONTAINER (display: flex):');
        console.log('  position:', computed.position);
        console.log('  overflow:', computed.overflow);
        console.log('  display:', computed.display);
        console.log('  height:', computed.height);
      }

      if (stickyLeftBoxRef.current) {
        const computed = window.getComputedStyle(stickyLeftBoxRef.current);
        console.log('📦 LEFT BOX (flex: 0 0 45%):');
        console.log('  position:', computed.position);
        console.log('  overflow:', computed.overflow);
        console.log('  height:', computed.height);
        console.log('  flex:', computed.flex);
      }

      if (stickyInnerBoxRef.current) {
        const computed = window.getComputedStyle(stickyInnerBoxRef.current);
        console.log('📌 STICKY INNER BOX (THE STICKY ELEMENT):');
        console.log('  position:', computed.position);
        console.log('  top:', computed.top);
        console.log('  z-index:', computed.zIndex);
        console.log('  height:', computed.height);
        console.log('  ✅ Should be: position: sticky, top: 80px');

        // Check if any parent has overflow hidden
        let parent = stickyInnerBoxRef.current.parentElement;
        let level = 1;
        console.log('\n🔼 CHECKING PARENT HIERARCHY FOR BLOCKERS:');
        while (parent && level <= 5) {
          const parentComputed = window.getComputedStyle(parent);
          const hasOverflowHidden = parentComputed.overflow !== 'visible' ||
                                     parentComputed.overflowY !== 'visible' ||
                                     parentComputed.overflowX !== 'visible';
          const hasPositionRelative = parentComputed.position === 'relative';

          console.log(`  Level ${level} (${parent.tagName}):`, {
            position: parentComputed.position,
            overflow: parentComputed.overflow,
            overflowY: parentComputed.overflowY,
            height: parentComputed.height,
            '⚠️ BLOCKER': hasOverflowHidden || hasPositionRelative ? 'YES' : 'NO'
          });

          parent = parent.parentElement;
          level++;
        }
      }

      console.log('═══════════════════════════════════════════════════════\n');
    };

    // Log after a short delay to ensure styles are computed
    setTimeout(logStyles, 1000);
  }, []);

  // Dynamic sticky positioning effect (inspired by CodePen example)
  useEffect(() => {
    const handleScroll = () => {
      if (!isMobile && stickyFlexBoxRef.current && stickyLeftBoxRef.current && stickyInnerBoxRef.current) {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const sectionTop = stickyFlexBoxRef.current.offsetTop;
        const leftWidth = stickyLeftBoxRef.current.offsetWidth;
        const stickyHeight = stickyInnerBoxRef.current.offsetHeight;

        // Calculate when sticky should activate (when element reaches 50% viewport)
        const stickStartScroll = sectionTop - (viewportHeight / 2) + (stickyHeight / 2);

        // Get the last card (index 2) to determine when to stop sticking
        const lastCard = cardRefs.current[2];
        let stickEndScroll = Infinity;
        let absoluteTopPosition = '0';

        if (lastCard) {
          // Get the position and dimensions of the last card relative to the page
          const lastCardRect = lastCard.getBoundingClientRect();
          const lastCardTop = scrollY + lastCardRect.top;
          const lastCardHeight = lastCardRect.height;
          const lastCardCenter = lastCardTop + (lastCardHeight / 2);

          // Calculate the center of the sticky heading
          const stickyCenter = viewportHeight / 2;

          // Stop sticking when the vertical center of the last card aligns with the center of the sticky heading (50% viewport)
          // This is when: lastCardCenter - scrollY = stickyCenter
          // Rearranged: scrollY = lastCardCenter - stickyCenter
          stickEndScroll = lastCardCenter - stickyCenter;

          // Calculate the absolute position: where the sticky element should be positioned relative to the section
          // so that its center aligns with the last card's center
          const stickyTopWhenCentered = lastCardCenter - (stickyHeight / 2);
          absoluteTopPosition = `${stickyTopWhenCentered - sectionTop}px`;
        }

        // Update width for fixed positioning
        setStickyWidth(leftWidth);

        if (scrollY < stickStartScroll) {
          // Before reaching 50% viewport - use relative positioning
          setStickyPosition('relative');
          setStickyTopPosition('0');
        } else if (scrollY >= stickStartScroll && scrollY <= stickEndScroll) {
          // Element is at 50% viewport - keep it fixed at center
          setStickyPosition('fixed');
          setStickyTopPosition(`${viewportHeight / 2 - (stickyHeight / 2)}px`);
        } else {
          // Last card has reached the sticky position - use absolute positioning at calculated position
          setStickyPosition('absolute');
          setStickyTopPosition(absoluteTopPosition);
        }
      }
    };

    const handleResize = () => {
      handleScroll(); // Recalculate on resize
    };

    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile]);

  // Scroll-based fade effect for right-side cards
  useEffect(() => {
    const calculateCardOpacities = () => {
      if (isMobile) return; // Only apply on desktop

      const viewportCenter = window.innerHeight / 2;
      const newOpacities = cardRefs.current.map((card) => {
        if (!card) return 0.5;

        const rect = card.getBoundingClientRect();
        const cardTop = rect.top;
        const cardBottom = rect.bottom;
        const cardCenter = (cardTop + cardBottom) / 2;

        // Calculate distance from viewport center
        const distanceFromCenter = Math.abs(cardCenter - viewportCenter);
        const maxDistance = window.innerHeight / 2; // Max distance is half viewport

        // Calculate opacity: 1.0 at center, fades to 0.5 at edges
        // Using linear interpolation
        const opacity = Math.max(0.5, 1 - (distanceFromCenter / maxDistance) * 0.5);

        return opacity;
      });

      setCardOpacities(newOpacities);
    };

    calculateCardOpacities(); // Initial calculation
    window.addEventListener('scroll', calculateCardOpacities);
    window.addEventListener('resize', calculateCardOpacities);

    return () => {
      window.removeEventListener('scroll', calculateCardOpacities);
      window.removeEventListener('resize', calculateCardOpacities);
    };
  }, [isMobile]);

  const handleFaqChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  const handleGetStarted = () => {
    // Navigate to pricing page
    navigate('/pricing');
  };

  // Three-pillar benefits
  const benefits = [
    {
      icon: <LocationOnIcon sx={{ fontSize: 40, color: '#FFD700' }} />,
      title: 'Local First',
      description: 'Gain local followers with your Jax Saver Business profile share your business, links, products, services, photos, and contact information.',
    },
    {
      icon: <CampaignIcon sx={{ fontSize: 40, color: '#FFD700' }} />,
      title: 'Custom Marketing',
      description: 'Market to thousands of locals with our promotion and event wizards, create coupons, and specials with ease as often as you\'d like.',
    },
    {
      icon: <NotificationsActiveIcon sx={{ fontSize: 40, color: '#FFD700' }} />,
      title: 'Powerful Discovery',
      description: 'Local users are notified in-app of any promotions or events you\'re running when they are close by.',
    },
  ];

  // How it works steps
  const steps = [
    {
      number: '1',
      title: 'Claim',
      description: 'Confirm your business information and start your profile setup.',
    },
    {
      number: '2',
      title: 'Personalize',
      description: 'Make your profile stand out with photos, offers, and events.',
    },
    {
      number: '3',
      title: 'Manage',
      description: 'Track performance and engage with customers through your dashboard.',
    },
  ];

  // FAQ items
  const faqs = [
    {
      id: 'faq1',
      question: 'How much does JaxSaver cost?',
      answer: 'Creating a business profile is completely free. We offer flexible subscription plans when you want to promote your business and reach more customers. You only pay for the features you use.',
    },
    {
      id: 'faq2',
      question: 'What types of businesses can use JaxSaver?',
      answer: 'JaxSaver works for all types of local businesses - restaurants, retail stores, service providers, fitness studios, salons, and more. Any business that wants to attract local customers can benefit.',
    },
    {
      id: 'faq3',
      question: 'How do customers find my business?',
      answer: 'Customers discover your business through the JaxSaver mobile app, where they browse local deals and promotions. Your profile and offers appear in search results and category listings.',
    },
    {
      id: 'faq4',
      question: 'Can I track promotion performance?',
      answer: 'Yes! Our dashboard shows you how many people view your promotions, how many save them, and redemption analytics so you can measure your ROI.',
    },
    {
      id: 'faq5',
      question: 'How quickly can I get started?',
      answer: 'You can create your business profile in just minutes. Add your basic information, upload photos, and start creating promotions right away.',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: '#f5f5f7',
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <Container sx={{ maxWidth: '1096px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 4, md: 8 }, alignItems: 'center' }}>
            <Box sx={{ flex: 2, pr: { md: 4 } }}>
              <Typography
                component="h1"
                variant="h2"
                sx={{
                  fontWeight: 500,
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '3rem' },
                  lineHeight: 1.2,
                  color: '#1d1d1f',
                }}
              >
                <Box component="span" sx={{ color: '#FFD700', fontWeight: 700 }}>
                  All In One
                </Box>{' '}
                Local Marketing Platform
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  lineHeight: 1.6,
                  fontSize: '1.25rem',
                  color: '#1d1d1f',
                }}
              >
                Connect with thousands of local customers through JaxSaver's mobile app. Create a free Business Profile, share promotions and events, and get discovered by nearby users actively looking for deals in your area.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleGetStarted}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  textTransform: 'none',
                  borderRadius: 1,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 1,
                  },
                }}
              >
                Start For Free
              </Button>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {/* JaxSaver Business Profile Demo GIF */}
              <Box
                component="img"
                src="/business-profile-follow.gif"
                alt="JaxSaver Business Profile Demo"
                sx={{
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: 600,
                  borderRadius: 3,
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Three-Pillar Benefits Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#000000' }}>
        <Container sx={{ maxWidth: '1096px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 8, justifyContent: 'center' }}>
            {benefits.map((benefit, index) => (
              <Box key={index} sx={{ flex: 1, textAlign: 'center', maxWidth: { md: 380 } }}>
                <Box
                  sx={{
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    bgcolor: '#2C2C2E',
                    mx: 'auto',
                  }}
                >
                  {benefit.icon}
                </Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 400, color: '#FFFFFF', fontSize: '28px' }}>
                  {benefit.title}
                </Typography>
                <Typography variant="body1" sx={{ color: '#8E8E93', lineHeight: 1.7, fontSize: '1.25rem' }}>
                  {benefit.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Take Charge of Your First Impression - Interactive Accordion */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f5f5f7' }}>
        <Container sx={{ maxWidth: '1096px !important' }}>
          <Typography
            variant="h3"
            align="center"
            sx={{
              mb: 8,
              fontWeight: 500,
              fontSize: { xs: '2.5rem', md: '48px' },
              color: '#1d1d1f',
            }}
          >
            Don't leave first impressions to chance
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 8, alignItems: 'flex-start' }}>
            {/* Left side - Accordion items */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Slide 1 - Best Foot Forward */}
              <Box
                onClick={() => setActiveSlide(0)}
                sx={{
                  cursor: 'pointer',
                  py: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#e8e8ed',
                  },
                  display: 'flex',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: '2px',
                    bgcolor: '#d2d2d7',
                    position: 'relative',
                    overflow: 'hidden',
                    alignSelf: 'stretch',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '0%',
                      bgcolor: '#FFD700',
                      ...(activeSlide === 0 && {
                        animation: 'fillProgress 5s linear forwards',
                      }),
                      '@keyframes fillProgress': {
                        '0%': { height: '0%' },
                        '100%': { height: '100%' },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: activeSlide === 0 ? '#1d1d1f' : '#86868b',
                    fontSize: activeSlide === 0 ? '28px' : '20px',
                    transition: 'color 0.3s ease, font-size 0.3s ease',
                  }}
                >
                  Info In One Place
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateRows: activeSlide === 0 ? '1fr' : '0fr',
                    transition: 'grid-template-rows 0.4s ease, opacity 0.4s ease',
                    opacity: activeSlide === 0 ? 1 : 0,
                  }}
                >
                  <Box sx={{ overflow: 'hidden', minHeight: 0 }}>
                    <Typography variant="body1" sx={{ color: activeSlide === 0 ? '#1d1d1f' : '#86868b', lineHeight: 1.7, fontSize: '16px' }}>
                      Provide accurate information like your phone number, operating hours and social media links, so customers can easily find you.
                    </Typography>
                  </Box>
                </Box>
                </Box>
              </Box>

              {/* Slide 2 - Show & Tell */}
              <Box
                onClick={() => setActiveSlide(1)}
                sx={{
                  cursor: 'pointer',
                  py: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#e8e8ed',
                  },
                  display: 'flex',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: '2px',
                    bgcolor: '#d2d2d7',
                    position: 'relative',
                    overflow: 'hidden',
                    alignSelf: 'stretch',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '0%',
                      bgcolor: '#FFD700',
                      ...(activeSlide === 1 && {
                        animation: 'fillProgress 5s linear forwards',
                      }),
                      '@keyframes fillProgress': {
                        '0%': { height: '0%' },
                        '100%': { height: '100%' },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      color: activeSlide === 1 ? '#1d1d1f' : '#86868b',
                      fontSize: activeSlide === 1 ? '28px' : '20px',
                      transition: 'color 0.3s ease, font-size 0.3s ease',
                    }}
                  >
                    Show & Tell
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateRows: activeSlide === 1 ? '1fr' : '0fr',
                      transition: 'grid-template-rows 0.4s ease, opacity 0.4s ease',
                      opacity: activeSlide === 1 ? 1 : 0,
                    }}
                  >
                    <Box sx={{ overflow: 'hidden', minHeight: 0 }}>
                      <Typography variant="body1" sx={{ color: activeSlide === 1 ? '#1d1d1f' : '#86868b', lineHeight: 1.7, fontSize: '16px' }}>
                        Show your businesse's photos of services, products and more with an easy to manage orgizned photo gallery.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Slide 3 - Share Promos & Events */}
              <Box
                onClick={() => setActiveSlide(2)}
                sx={{
                  cursor: 'pointer',
                  py: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#e8e8ed',
                  },
                  display: 'flex',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: '2px',
                    bgcolor: '#d2d2d7',
                    position: 'relative',
                    overflow: 'hidden',
                    alignSelf: 'stretch',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '0%',
                      bgcolor: '#FFD700',
                      ...(activeSlide === 2 && {
                        animation: 'fillProgress 5s linear forwards',
                      }),
                      '@keyframes fillProgress': {
                        '0%': { height: '0%' },
                        '100%': { height: '100%' },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      color: activeSlide === 2 ? '#1d1d1f' : '#86868b',
                      fontSize: activeSlide === 2 ? '28px' : '20px',
                      transition: 'color 0.3s ease, font-size 0.3s ease',
                    }}
                  >
                    Share Promos & Events
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateRows: activeSlide === 2 ? '1fr' : '0fr',
                      transition: 'grid-template-rows 0.4s ease, opacity 0.4s ease',
                      opacity: activeSlide === 2 ? 1 : 0,
                    }}
                  >
                    <Box sx={{ overflow: 'hidden', minHeight: 0 }}>
                      <Typography variant="body1" sx={{ color: activeSlide === 2 ? '#1d1d1f' : '#86868b', lineHeight: 1.7, fontSize: '16px' }}>
                        Create compelling promotions and events that drive foot traffic. Use our easy wizards to craft limited-time offers, seasonal deals, and special events that automatically notify nearby users.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Right side - Business card mockup */}
            <Box sx={{ flex: 1, minWidth: 0, position: 'relative' }}>
              <Box
                sx={{
                  position: 'relative',
                  minHeight: 500,
                }}
              >
                {/* Slide 1 - Best Foot Forward */}
                {activeSlide === 0 && (
                  <Box
                    component="img"
                    src="/business info.png"
                    alt="Best Foot Forward - Business Info"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      animation: 'fadeSlideIn 0.6s ease-out',
                      '@keyframes fadeSlideIn': {
                        '0%': {
                          opacity: 0,
                          transform: 'translateX(20px)',
                        },
                        '100%': {
                          opacity: 1,
                          transform: 'translateX(0)',
                        },
                      },
                    }}
                  />
                )}

                {/* Slide 2 - Show & Tell */}
                {activeSlide === 1 && (
                  <Box
                    component="img"
                    src="/show and tail.png"
                    alt="Show & Tell - Business Photos"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      animation: 'fadeSlideIn 0.6s ease-out',
                      '@keyframes fadeSlideIn': {
                        '0%': {
                          opacity: 0,
                          transform: 'translateX(20px)',
                        },
                        '100%': {
                          opacity: 1,
                          transform: 'translateX(0)',
                        },
                      },
                    }}
                  />
                )}

                {/* Slide 3 - Share Promos & Events */}
                {activeSlide === 2 && (
                  <Box
                    component="img"
                    src="/share promos and events.png"
                    alt="Share Promos & Events"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      animation: 'fadeSlideIn 0.6s ease-out',
                      '@keyframes fadeSlideIn': {
                        '0%': {
                          opacity: 0,
                          transform: 'translateX(20px)',
                        },
                        '100%': {
                          opacity: 1,
                          transform: 'translateX(0)',
                        },
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Easily Connect with Customers - Interactive Accordion Slider */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#000000' }}>
        <Container sx={{ maxWidth: '1096px !important' }}>
          <Typography
            variant="h3"
            align="center"
            sx={{
              mb: 8,
              fontWeight: 500,
              fontSize: { xs: '2.5rem', md: '48px' },
              color: '#FFFFFF',
            }}
          >
            Easily connect with customers
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6 }}>
            {/* Left Side - Dynamic Content Mockups */}
            <Box sx={{ flex: 1, minWidth: 0, position: 'relative' }}>
              <Box
                sx={{
                  position: 'relative',
                  minHeight: 500,
                }}
              >
                {/* Slide 1 - Easy Redemptions */}
                {activeConnectSlide === 0 && (
                  <Box
                    component="img"
                    src="/easy redemptions.png"
                    alt="Easy Redemptions"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      animation: 'fadeSlideIn 0.6s ease-out',
                      '@keyframes fadeSlideIn': {
                        '0%': {
                          opacity: 0,
                          transform: 'translateX(20px)',
                        },
                        '100%': {
                          opacity: 1,
                          transform: 'translateX(0)',
                        },
                      },
                    }}
                  />
                )}

                {/* OLD POSTS MOCKUP REMOVED - Header */}
                {false && (
                  <Box>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          bgcolor: '#4CAF50',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                        }}
                      >
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                          GD
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 500, color: '#FFFFFF' }}>
                          The Good Design Store
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#8E8E93' }}>
                          Design Shop • Jacksonville, FL
                        </Typography>
                      </Box>
                    </Box>

                    {/* Posts Grid */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {/* Post 1 */}
                      <Box sx={{ borderBottom: '1px solid #3A3A3C', pb: 3 }}>
                        <Typography variant="body2" sx={{ color: '#FFD700', mb: 1, fontWeight: 500 }}>
                          OFFER • Posted 2 days ago
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                          20% Off All Prints This Week
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#8E8E93', mb: 2 }}>
                          Get 20% off all wall art and prints through Sunday. Perfect time to refresh your space!
                        </Typography>
                        <Box
                          sx={{
                            height: 180,
                            bgcolor: '#2C2C2E',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            [Product Image]
                          </Typography>
                        </Box>
                      </Box>

                      {/* Post 2 */}
                      <Box>
                        <Typography variant="body2" sx={{ color: '#8E8E93', mb: 1, fontWeight: 500 }}>
                          UPDATE • Posted 5 days ago
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                          New Spring Collection Now Available
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#8E8E93' }}>
                          Check out our latest arrivals featuring vibrant colors and modern designs.
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Slide 2 - Deliver Results */}
                {activeConnectSlide === 1 && (
                  <Box
                    component="img"
                    src="/search.png"
                    alt="Deliver Results - Search"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      animation: 'fadeSlideIn 0.6s ease-out',
                      '@keyframes fadeSlideIn': {
                        '0%': {
                          opacity: 0,
                          transform: 'translateX(20px)',
                        },
                        '100%': {
                          opacity: 1,
                          transform: 'translateX(0)',
                        },
                      },
                    }}
                  />
                )}

                {/* OLD MOCKUP REMOVED - Rating Summary */}
                {false && (
                  <Box>
                    {/* Rating Summary */}
                    <Box sx={{ mb: 4, pb: 3, borderBottom: '1px solid #3A3A3C' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h2" sx={{ fontWeight: 500, mr: 2, color: '#FFFFFF' }}>
                          4.8
                        </Typography>
                        <Box>
                          <Box sx={{ display: 'flex', mb: 0.5 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Box
                                key={star}
                                sx={{
                                  width: 20,
                                  height: 20,
                                  bgcolor: star <= 4 ? '#FBBC04' : '#e0e0e0',
                                  mr: 0.5,
                                  borderRadius: '2px',
                                }}
                              />
                            ))}
                          </Box>
                          <Typography variant="body2" sx={{ color: '#8E8E93' }}>
                            Based on 247 reviews
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Individual Reviews */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {/* Review 1 */}
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: '#9C27B0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 1.5,
                            }}
                          >
                            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                              SJ
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Sarah Johnson
                            </Typography>
                            <Box sx={{ display: 'flex' }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Box
                                  key={star}
                                  sx={{
                                    width: 14,
                                    height: 14,
                                    bgcolor: '#FBBC04',
                                    mr: 0.3,
                                    borderRadius: '2px',
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#8E8E93', mb: 1 }}>
                          Amazing selection and helpful staff! Found exactly what I was looking for.
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#FFD700', cursor: 'pointer' }}>
                          Reply
                        </Typography>
                      </Box>

                      {/* Review 2 with Response */}
                      <Box sx={{ borderTop: '1px solid #e0e0e0', pt: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: '#FF5722',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 1.5,
                            }}
                          >
                            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                              MK
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Michael Kim
                            </Typography>
                            <Box sx={{ display: 'flex' }}>
                              {[1, 2, 3, 4].map((star) => (
                                <Box
                                  key={star}
                                  sx={{
                                    width: 14,
                                    height: 14,
                                    bgcolor: '#FBBC04',
                                    mr: 0.3,
                                    borderRadius: '2px',
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#8E8E93', mb: 2 }}>
                          Great products but wish you had longer hours on weekends.
                        </Typography>
                        {/* Business Response */}
                        <Box sx={{ pl: 3, borderLeft: '3px solid #3A3A3C', ml: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                            Response from The Good Design Store
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#8E8E93', fontSize: '0.85rem' }}>
                            Thanks for your feedback! We're extending our Saturday hours starting next month.
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Slide 3 - Be Discovered */}
                {activeConnectSlide === 2 && (
                  <Box
                    component="img"
                    src="/get discovered.png"
                    alt="Be Discovered"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      animation: 'fadeSlideIn 0.6s ease-out',
                      '@keyframes fadeSlideIn': {
                        '0%': { opacity: 0, transform: 'translateX(20px)' },
                        '100%': { opacity: 1, transform: 'translateX(0)' },
                      },
                    }}
                  />
                )}

                {/* Old FAQs Mockup - Preserved for reference */}
                {false && activeConnectSlide === 2 && (
                  <Box
                    sx={{
                      animation: 'fadeSlideIn 0.6s ease-out',
                      '@keyframes fadeSlideIn': {
                        '0%': {
                          opacity: 0,
                          transform: 'translateX(20px)',
                        },
                        '100%': {
                          opacity: 1,
                          transform: 'translateX(0)',
                        },
                      },
                      p: 4,
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 500, color: '#FFFFFF' }}>
                      Frequently Asked Questions
                    </Typography>

                    {/* FAQ Items */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {/* FAQ 1 */}
                      <Box sx={{ pb: 3, borderBottom: '1px solid #3A3A3C' }}>
                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 1.5, color: '#FFFFFF' }}>
                          Do you offer custom framing services?
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#8E8E93', lineHeight: 1.6 }}>
                          Yes! We offer professional custom framing for all types of artwork. Our team can help you choose the perfect frame and matting to complement your piece.
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#8E8E93', mt: 1, display: 'block' }}>
                          Answered by business • 2 weeks ago
                        </Typography>
                      </Box>

                      {/* FAQ 2 */}
                      <Box sx={{ pb: 3, borderBottom: '1px solid #3A3A3C' }}>
                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 1.5, color: '#FFFFFF' }}>
                          What are your return policies?
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#8E8E93', lineHeight: 1.6 }}>
                          We accept returns within 30 days of purchase with original receipt. Items must be in original condition. Custom orders are final sale.
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#8E8E93', mt: 1, display: 'block' }}>
                          Answered by business • 1 month ago
                        </Typography>
                      </Box>

                      {/* FAQ 3 */}
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 1.5, color: '#FFFFFF' }}>
                          Do you ship nationwide?
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#8E8E93', lineHeight: 1.6 }}>
                          Yes, we ship to all 50 states! Shipping costs vary based on size and destination. Free shipping on orders over $150.
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#8E8E93', mt: 1, display: 'block' }}>
                          Answered by business • 3 weeks ago
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Right Side - Accordion Items */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Slide 1 - Create posts, offers, and events */}
              <Box
                onClick={() => setActiveConnectSlide(0)}
                sx={{
                  cursor: 'pointer',
                  py: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#2C2C2E',
                  },
                  display: 'flex',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: '2px',
                    bgcolor: '#2C2C2E',
                    position: 'relative',
                    overflow: 'hidden',
                    alignSelf: 'stretch',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '0%',
                      bgcolor: '#FFD700',
                      ...(activeConnectSlide === 0 && {
                        animation: 'fillProgress 5s linear forwards',
                      }),
                      '@keyframes fillProgress': {
                        '0%': { height: '0%' },
                        '100%': { height: '100%' },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      color: activeConnectSlide === 0 ? '#FFFFFF' : '#8E8E93',
                      fontSize: activeConnectSlide === 0 ? '28px' : '20px',
                      transition: 'color 0.3s ease, font-size 0.3s ease',
                    }}
                  >
                    Easy Redemptions
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateRows: activeConnectSlide === 0 ? '1fr' : '0fr',
                      transition: 'grid-template-rows 0.4s ease, opacity 0.4s ease',
                      opacity: activeConnectSlide === 0 ? 1 : 0,
                    }}
                  >
                    <Box sx={{ overflow: 'hidden', minHeight: 0 }}>
                      <Typography variant="body1" sx={{ color: activeConnectSlide === 0 ? '#FFFFFF' : '#8E8E93', lineHeight: 1.7, fontSize: '16px' }}>
                        Customers save promotions and events allowing them to rsvp to events or redeem in person. Redemptions and RSVPs are tracked in your business dashboard.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Slide 2 - Respond to reviews */}
              <Box
                onClick={() => setActiveConnectSlide(1)}
                sx={{
                  cursor: 'pointer',
                  py: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#2C2C2E',
                  },
                  display: 'flex',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: '2px',
                    bgcolor: '#2C2C2E',
                    position: 'relative',
                    overflow: 'hidden',
                    alignSelf: 'stretch',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '0%',
                      bgcolor: '#FFD700',
                      ...(activeConnectSlide === 1 && {
                        animation: 'fillProgress 5s linear forwards',
                      }),
                      '@keyframes fillProgress': {
                        '0%': { height: '0%' },
                        '100%': { height: '100%' },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      color: activeConnectSlide === 1 ? '#FFFFFF' : '#8E8E93',
                      fontSize: activeConnectSlide === 1 ? '28px' : '20px',
                      transition: 'color 0.3s ease, font-size 0.3s ease',
                    }}
                  >
                    Deliver Results
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateRows: activeConnectSlide === 1 ? '1fr' : '0fr',
                      transition: 'grid-template-rows 0.4s ease, opacity 0.4s ease',
                      opacity: activeConnectSlide === 1 ? 1 : 0,
                    }}
                  >
                    <Box sx={{ overflow: 'hidden', minHeight: 0 }}>
                      <Typography variant="body1" sx={{ color: activeConnectSlide === 1 ? '#FFFFFF' : '#8E8E93', lineHeight: 1.7, fontSize: '16px' }}>
                        When users search for a specific item or service have the power to deliver the result directly your local result directly to them.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Slide 3 - Post answers to FAQs */}
              <Box
                onClick={() => setActiveConnectSlide(2)}
                sx={{
                  cursor: 'pointer',
                  py: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#2C2C2E',
                  },
                  display: 'flex',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: '2px',
                    bgcolor: '#2C2C2E',
                    position: 'relative',
                    overflow: 'hidden',
                    alignSelf: 'stretch',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '0%',
                      bgcolor: '#FFD700',
                      ...(activeConnectSlide === 2 && {
                        animation: 'fillProgress 5s linear forwards',
                      }),
                      '@keyframes fillProgress': {
                        '0%': { height: '0%' },
                        '100%': { height: '100%' },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      color: activeConnectSlide === 2 ? '#FFFFFF' : '#8E8E93',
                      fontSize: activeConnectSlide === 2 ? '28px' : '20px',
                      transition: 'color 0.3s ease, font-size 0.3s ease',
                    }}
                  >
                    Be Discovered
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateRows: activeConnectSlide === 2 ? '1fr' : '0fr',
                      transition: 'grid-template-rows 0.4s ease, opacity 0.4s ease',
                      opacity: activeConnectSlide === 2 ? 1 : 0,
                    }}
                  >
                    <Box sx={{ overflow: 'hidden', minHeight: 0 }}>
                      <Typography variant="body1" sx={{ color: activeConnectSlide === 2 ? '#FFFFFF' : '#8E8E93', lineHeight: 1.7, fontSize: '16px' }}>
                        Push notifications directly to locals to let them know of new deals and events, when deals are expiring, when a promotion or event is nearby and more.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Show What You Offer - Sticky Left, Scrolling Right */}
      <Box ref={stickyOuterBoxRef} sx={{
        py: { xs: 8, md: 12 },
        bgcolor: '#000000',
      }}>
        <Container ref={stickyContainerRef} maxWidth="lg">
          <Box ref={stickyFlexBoxRef} sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 8,
            alignItems: { xs: 'flex-start', md: 'stretch' },
          }}>
            {/* Left Side - Sticky Heading and Description */}
            <Box
              ref={stickyLeftBoxRef}
              sx={{
                flex: '0 0 45%',
                alignSelf: 'stretch',
                position: 'relative', // Parent stays in flow to maintain column structure and prevent layout shift
              }}
            >
              {/* Child wrapper becomes fixed - this pattern prevents the parent column from collapsing */}
              <Box
                ref={stickyInnerBoxRef}
                sx={{
                  position: {
                    xs: 'relative',
                    md: stickyPosition === 'fixed' ? 'fixed' : stickyPosition === 'absolute' ? 'absolute' : 'relative'
                  },
                  top: {
                    md: stickyPosition !== 'relative' ? stickyTopPosition : '0'
                  },
                  width: { md: stickyWidth > 0 ? `${stickyWidth}px` : '100%' },
                  maxWidth: '100%',
                  zIndex: 10,
                }}
              >
              <Typography
                variant="h3"
                sx={{
                  mb: 3,
                  fontWeight: 500,
                  fontSize: { xs: '2.5rem', md: '48px' },
                  color: '#FFFFFF',
                  lineHeight: 1.2,
                }}
              >
                Show what you offer, from products to services
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#8E8E93',
                  lineHeight: 1.7,
                  fontSize: '1.25rem',
                }}
              >
                Whether you're a restaurant, store, or service provider, your profile helps customers do business with you easily and directly with product inventory, ordering, bookings, quotes, and more.
              </Typography>
              </Box>
            </Box>

            {/* Right Side - Scrolling Content Cards */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
              {/* Card 1: Accept food orders and more */}
              <Box
                ref={(el) => (cardRefs.current[0] = el)}
                sx={{
                  opacity: cardOpacities[0],
                  transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: '#2C2C2E',
                    borderRadius: 3,
                    overflow: 'hidden',
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      height: 350,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 3,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      BBQ Restaurant Order Mockup
                    </Typography>
                  </Box>
                </Paper>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 500, color: '#FFFFFF' }}>
                  Accept food orders and more
                </Typography>
                <Typography variant="body1" sx={{ color: '#8E8E93', lineHeight: 1.7, mb: 1 }}>
                  Take orders for delivery and pickup and let customers make reservations. Even add your menu, so people can discover your best dishes.
                </Typography>
                <Typography
                  component="a"
                  href="#"
                  sx={{
                    color: '#FFD700',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Learn more
                </Typography>
              </Box>

              {/* Card 2: Be found for what you sell */}
              <Box
                ref={(el) => (cardRefs.current[1] = el)}
                sx={{
                  opacity: cardOpacities[1],
                  transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: '#2C2C2E',
                    borderRadius: 3,
                    overflow: 'hidden',
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      height: 350,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 3,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Product Catalog Mockup
                    </Typography>
                  </Box>
                </Paper>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 500, color: '#FFFFFF' }}>
                  Be found for what you sell
                </Typography>
                <Typography variant="body1" sx={{ color: '#8E8E93', lineHeight: 1.7 }}>
                  Be found by automatically listing your in-store products on your Business Profile. Customers can see what you offer before they come by.
                </Typography>
              </Box>

              {/* Card 3: Offer your services */}
              <Box
                ref={(el) => (cardRefs.current[2] = el)}
                sx={{
                  opacity: cardOpacities[2],
                  transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: '#2C2C2E',
                    borderRadius: 3,
                    overflow: 'hidden',
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      height: 350,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 3,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Services List Mockup
                    </Typography>
                  </Box>
                </Paper>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 500, color: '#FFFFFF' }}>
                  Offer your services
                </Typography>
                <Typography variant="body1" sx={{ color: '#8E8E93', lineHeight: 1.7 }}>
                  Service providers can list their offerings with clear pricing and descriptions. From haircuts to personal training, make it easy for customers to understand your services.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Analytics/Metrics Showcase Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#000000' }}>
        <Container sx={{ maxWidth: '1096px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 8, alignItems: 'center' }}>
            {/* Right Side - Analytics Mockup (now on left) */}
            <Box sx={{ flex: 1 }}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: '#2C2C2E',
                  height: 450,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  p: 4,
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 600,
                    color: '#FFD700',
                    mb: 2,
                  }}
                >
                  8,210
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Total Profile Views This Month
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    height: 200,
                    bgcolor: '#1C1C1E',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Analytics Graph Mockup
                  </Typography>
                </Box>
              </Paper>
            </Box>
            {/* Left Side - Text Content (now on right) */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 500, color: '#FFFFFF' }}>
                Know how customers find your business
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: '#8E8E93', lineHeight: 1.7 }}>
                Get insights into how customers discover and interact with your business profile. Track views, saves, and redemptions to measure your success.
              </Typography>
              <Box component="ul" sx={{ pl: 0, listStyle: 'none' }}>
                {[
                  'See how many customers view your profile',
                  'Track promotion performance and saves',
                  'Monitor customer engagement trends',
                  'Understand peak discovery times',
                ].map((item, index) => (
                  <Box
                    component="li"
                    key={index}
                    sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                  >
                    <BarChartIcon sx={{ color: '#FFD700', mr: 2, fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: '#8E8E93' }}>{item}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Testimonial Section - Large Photo Style */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f5f5f7' }}>
        <Container sx={{ maxWidth: '1096px !important' }}>
          <Typography
            variant="h3"
            align="center"
            sx={{
              mb: 8,
              fontWeight: 500,
              fontSize: { xs: '2.5rem', md: '48px' },
              color: '#1d1d1f',
            }}
          >
            What success looks like
          </Typography>
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                bgcolor: '#3A3A3C',
                height: { xs: 400, md: 500 },
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Large Success Story Photo - Coffee Shop Interior
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: 20, md: 40 },
                left: { xs: 20, md: 40 },
                right: { xs: 20, md: 40 },
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                p: 4,
                borderRadius: 2,
                maxWidth: 600,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontStyle: 'italic',
                  color: '#FFFFFF',
                  lineHeight: 1.5,
                }}
              >
                "The customer's ability to find us on JaxSaver and see our promotions on Maps drives them back into our shop regularly."
              </Typography>
              <Typography variant="body2" sx={{ color: '#8E8E93', fontWeight: 500 }}>
                Alejandra Chavez
              </Typography>
              <Typography variant="body2" sx={{ color: '#8E8E93' }}>
                Owner, Local Coffee Shop
              </Typography>
            </Box>
          </Box>
          {/* Carousel navigation dots */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
            {[1, 2, 3, 4].map((dot) => (
              <Box
                key={dot}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: dot === 1 ? '#FFD700' : '#e0e0e0',
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Show the Best of Your Business CTA */}
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#000000', textAlign: 'center' }}>
        <Container sx={{ maxWidth: '1096px !important' }}>
          <Typography
            variant="h3"
            sx={{
              mb: 3,
              fontWeight: 500,
              fontSize: { xs: '2.5rem', md: '48px' },
              color: '#FFFFFF',
            }}
          >
            Show the best of your business
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#8E8E93' }}>
            Ready to put content front and center? Update your Business Profile to show customers why they'll love your business.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              textTransform: 'none',
              borderRadius: 1,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 1,
              },
            }}
          >
            Start now
          </Button>
        </Container>
      </Box>

      {/* How It Works Section - Three Steps */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#000000' }}>
        <Container sx={{ maxWidth: '1096px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6, justifyContent: 'center' }}>
            {steps.map((step, index) => (
              <Box key={index} sx={{ flex: 1, textAlign: 'center', maxWidth: { md: 350 } }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 300,
                    color: '#e0e0e0',
                    fontSize: '5rem',
                    mb: 2,
                  }}
                >
                  {step.number}
                </Typography>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 500, color: '#FFFFFF' }}>
                  {step.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#8E8E93', lineHeight: 1.6 }}>
                  {step.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#000000' }}>
        <Container sx={{ maxWidth: '1096px !important' }}>
          <Typography
            variant="h3"
            align="center"
            sx={{
              mb: 6,
              fontWeight: 500,
              fontSize: { xs: '2.5rem', md: '48px' },
              color: '#FFFFFF',
            }}
          >
            Your questions, answered
          </Typography>
          {faqs.map((faq) => (
            <Accordion
              key={faq.id}
              expanded={expandedFaq === faq.id}
              onChange={handleFaqChange(faq.id)}
              sx={{
                mb: 2,
                boxShadow: 'none',
                '&:before': {
                  display: 'none',
                },
                bgcolor: '#1C1C1E',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    my: 2,
                  },
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#FFFFFF' }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: '#8E8E93', lineHeight: 1.7 }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: '#FFD700',
          color: '#000000',
          textAlign: 'center',
        }}
      >
        <Container sx={{ maxWidth: '1096px !important' }}>
          <Typography
            variant="h3"
            sx={{
              mb: 3,
              fontWeight: 500,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Ready to grow your business?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join hundreds of local businesses connecting with customers on JaxSaver
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={{
              px: 5,
              py: 2,
              fontSize: '1.1rem',
              textTransform: 'none',
              bgcolor: '#1C1C1E',
              color: '#FFD700',
              borderRadius: 1,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#2C2C2E',
                boxShadow: 'none',
              },
            }}
          >
            Get started for free
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 6,
          bgcolor: '#2C2C2E',
          borderTop: '1px solid #3A3A3C',
        }}
      >
        <Container sx={{ maxWidth: '1096px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, flexWrap: 'wrap' }}>
            <Box sx={{ flex: { md: '1 1 25%' }, minWidth: { xs: '100%', md: 200 } }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#FFFFFF' }}>
                JaxSaver
              </Typography>
              <Typography variant="body2" sx={{ color: '#8E8E93', lineHeight: 1.6 }}>
                Connecting local businesses with customers through deals and promotions.
              </Typography>
            </Box>
            <Box sx={{ flex: { md: '1 1 16%' }, minWidth: { xs: '50%', md: 150 } }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#FFFFFF' }}>
                Product
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#8E8E93', cursor: 'pointer' }}>
                    Features
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#8E8E93', cursor: 'pointer' }}>
                    Pricing
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#8E8E93', cursor: 'pointer' }}>
                    Success Stories
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ flex: { md: '1 1 16%' }, minWidth: { xs: '50%', md: 150 } }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#FFFFFF' }}>
                Company
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#8E8E93', cursor: 'pointer' }}>
                    About
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#8E8E93', cursor: 'pointer' }}>
                    Blog
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#8E8E93', cursor: 'pointer' }}>
                    Careers
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ flex: { md: '1 1 16%' }, minWidth: { xs: '50%', md: 150 } }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#FFFFFF' }}>
                Support
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#8E8E93', cursor: 'pointer' }}>
                    Help Center
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: '#8E8E93', cursor: 'pointer' }}
                    onClick={() => navigate('/contact')}
                  >
                    Contact Us
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#8E8E93', cursor: 'pointer' }}>
                    FAQ
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ flex: { md: '1 1 25%' }, minWidth: { xs: '50%', md: 200 } }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#FFFFFF' }}>
                Legal
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: '#8E8E93', cursor: 'pointer' }}
                    onClick={() => navigate('/terms')}
                  >
                    Terms of Service
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: '#8E8E93', cursor: 'pointer' }}
                    onClick={() => navigate('/privacy-policy')}
                  >
                    Privacy Policy
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid #3A3A3C' }}>
            <Typography variant="body2" sx={{ color: '#8E8E93' }} align="center">
              © {new Date().getFullYear()} JaxSaver. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default MarketingLandingPage;
