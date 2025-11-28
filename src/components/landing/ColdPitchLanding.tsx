import React, { useState, useRef } from 'react';
import { Box, Typography, Container, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Mic,
  FileText,
  Headphones,
  Phone,
  Users,
  Voicemail,
  Presentation,
  Target,
  Clock,
  Zap,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

// =============================================================================
// HERO SECTION - Audio Player with Play Me button
// =============================================================================
export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <Box
      component="section"
      sx={{
        pt: { xs: 14, md: 20 },
        pb: { xs: 10, md: 16 },
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
            fontWeight: 800,
            textAlign: 'center',
            mb: 2,
            color: 'white',
            letterSpacing: '-0.02em',
          }}
        >
          Cold Pitch
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: '1.125rem', sm: '1.25rem' },
            textAlign: 'center',
            mb: 6,
            color: '#94a3b8',
            maxWidth: '600px',
            mx: 'auto',
          }}
        >
          AI-powered sales scripts with professional audio.
          Perfect for cold calls, voicemail drops, and sales training.
        </Typography>

        {/* Audio Player Circle */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 6,
          }}
        >
          <Box
            onClick={handlePlayPause}
            sx={{
              width: { xs: 160, md: 200 },
              height: { xs: 160, md: 200 },
              borderRadius: '50%',
              bgcolor: '#fbbf24',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 0 60px rgba(251,191,36,0.4)',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 0 80px rgba(251,191,36,0.5)',
              },
            }}
          >
            {isPlaying ? (
              <Pause size={48} color="#0f172a" strokeWidth={2.5} />
            ) : (
              <Play size={48} color="#0f172a" strokeWidth={2.5} style={{ marginLeft: 8 }} />
            )}
            <Typography
              sx={{
                mt: 1,
                fontSize: '1rem',
                fontWeight: 700,
                color: '#0f172a',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {isPlaying ? 'Playing' : 'Play Me'}
            </Typography>
          </Box>

          {/* Hidden audio element */}
          <audio
            ref={audioRef}
            src="/assets/demo-pitch.mp3"
            onEnded={handleAudioEnded}
          />

          <Typography
            sx={{
              mt: 3,
              fontSize: '0.875rem',
              color: '#64748b',
            }}
          >
            Hear what Cold Pitch can create for you
          </Typography>
        </Box>

        {/* Get Started Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/admin/audio-generator/new')}
            endIcon={<ArrowRight size={20} />}
            sx={{
              bgcolor: 'white',
              color: '#0f172a',
              fontWeight: 700,
              fontSize: '1.125rem',
              px: 5,
              py: 2,
              borderRadius: '12px',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#f8fafc',
              },
            }}
          >
            Get Started Free
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

// =============================================================================
// USE CASES SECTION
// =============================================================================
const useCases = [
  {
    icon: Voicemail,
    title: 'Voicemail Drops',
    description: 'Pre-record professional voicemails that get callbacks. Drop them into any dialer system.',
    color: '#8b5cf6',
  },
  {
    icon: Users,
    title: 'Sales Training',
    description: 'Create consistent training materials. Let new reps learn from AI-perfected pitch scripts.',
    color: '#06b6d4',
  },
  {
    icon: Phone,
    title: 'Cold Calling Scripts',
    description: 'Generate proven cold call scripts tailored to your product and target audience.',
    color: '#10b981',
  },
  {
    icon: Presentation,
    title: 'Presentations',
    description: 'Add professional voiceovers to sales decks and video presentations.',
    color: '#f59e0b',
  },
];

export const UseCasesSection: React.FC = () => (
  <Box
    component="section"
    sx={{
      py: { xs: 10, md: 14 },
      bgcolor: '#f8fafc',
    }}
  >
    <Container maxWidth="lg">
      <Typography
        variant="h2"
        sx={{
          fontSize: { xs: '2rem', md: '2.5rem' },
          fontWeight: 700,
          textAlign: 'center',
          mb: 2,
          color: '#1e293b',
        }}
      >
        Built for Sales Professionals
      </Typography>
      <Typography
        sx={{
          fontSize: '1.125rem',
          textAlign: 'center',
          mb: 8,
          color: '#64748b',
          maxWidth: '600px',
          mx: 'auto',
        }}
      >
        From SDRs to sales managers, Cold Pitch helps teams close more deals
      </Typography>

      <Grid container spacing={4}>
        {useCases.map((useCase) => (
          <Grid item xs={12} sm={6} md={3} key={useCase.title}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                borderRadius: '16px',
                bgcolor: 'white',
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px -8px rgba(0,0,0,0.1)',
                },
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '12px',
                  bgcolor: `${useCase.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <useCase.icon size={28} color={useCase.color} />
              </Box>
              <Typography
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  mb: 1.5,
                  color: '#1e293b',
                }}
              >
                {useCase.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.9375rem',
                  color: '#64748b',
                  lineHeight: 1.6,
                }}
              >
                {useCase.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

// =============================================================================
// HOW IT WORKS SECTION
// =============================================================================
const steps = [
  {
    number: '01',
    title: 'Answer 8 Questions',
    description: 'Tell us about your product, target audience, and desired tone. Takes less than 2 minutes.',
    icon: FileText,
  },
  {
    number: '02',
    title: 'AI Generates Your Script',
    description: 'Our AI crafts a professional sales script tailored to your specific needs.',
    icon: Zap,
  },
  {
    number: '03',
    title: 'Get Professional Audio',
    description: 'Convert your script to studio-quality audio with natural-sounding AI voices.',
    icon: Headphones,
  },
];

export const HowItWorksSection: React.FC = () => (
  <Box
    component="section"
    id="how-it-works"
    sx={{
      py: { xs: 10, md: 14 },
      bgcolor: 'white',
      scrollMarginTop: '80px',
    }}
  >
    <Container maxWidth="lg">
      <Typography
        variant="h2"
        sx={{
          fontSize: { xs: '2rem', md: '2.5rem' },
          fontWeight: 700,
          textAlign: 'center',
          mb: 2,
          color: '#1e293b',
        }}
      >
        How It Works
      </Typography>
      <Typography
        sx={{
          fontSize: '1.125rem',
          textAlign: 'center',
          mb: 8,
          color: '#64748b',
          maxWidth: '500px',
          mx: 'auto',
        }}
      >
        From idea to professional audio in minutes
      </Typography>

      <Grid container spacing={4} alignItems="stretch">
        {steps.map((step, index) => (
          <Grid item xs={12} md={4} key={step.number}>
            <Box
              sx={{
                height: '100%',
                p: 4,
                borderRadius: '16px',
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                position: 'relative',
              }}
            >
              <Typography
                sx={{
                  fontSize: '4rem',
                  fontWeight: 800,
                  color: '#fbbf24',
                  opacity: 0.3,
                  position: 'absolute',
                  top: 16,
                  right: 24,
                  lineHeight: 1,
                }}
              >
                {step.number}
              </Typography>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  bgcolor: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <step.icon size={24} color="#0f172a" />
              </Box>
              <Typography
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  mb: 1.5,
                  color: '#1e293b',
                }}
              >
                {step.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.9375rem',
                  color: '#64748b',
                  lineHeight: 1.6,
                }}
              >
                {step.description}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

// =============================================================================
// FEATURES/BENEFITS SECTION
// =============================================================================
const features = [
  {
    icon: Clock,
    title: 'Save Hours Every Week',
    description: 'Stop writing scripts from scratch. Generate professional pitches in minutes, not hours.',
  },
  {
    icon: Target,
    title: 'Higher Response Rates',
    description: 'AI-optimized scripts are designed to capture attention and drive action.',
  },
  {
    icon: Mic,
    title: 'Studio-Quality Audio',
    description: 'ElevenLabs-powered voices that sound natural and professional.',
  },
  {
    icon: Users,
    title: 'Consistent Messaging',
    description: 'Keep your entire sales team on the same page with standardized scripts.',
  },
];

export const FeaturesSection: React.FC = () => (
  <Box
    component="section"
    id="features"
    sx={{
      py: { xs: 10, md: 14 },
      bgcolor: '#0f172a',
      scrollMarginTop: '80px',
    }}
  >
    <Container maxWidth="lg">
      <Typography
        variant="h2"
        sx={{
          fontSize: { xs: '2rem', md: '2.5rem' },
          fontWeight: 700,
          textAlign: 'center',
          mb: 2,
          color: 'white',
        }}
      >
        Why Sales Teams Love Cold Pitch
      </Typography>
      <Typography
        sx={{
          fontSize: '1.125rem',
          textAlign: 'center',
          mb: 8,
          color: '#94a3b8',
          maxWidth: '600px',
          mx: 'auto',
        }}
      >
        The fastest way to create professional sales content
      </Typography>

      <Grid container spacing={4}>
        {features.map((feature) => (
          <Grid item xs={12} sm={6} key={feature.title}>
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                p: 3,
                borderRadius: '16px',
                bgcolor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  bgcolor: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <feature.icon size={24} color="#0f172a" />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    mb: 1,
                    color: 'white',
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.9375rem',
                    color: '#94a3b8',
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

// =============================================================================
// TESTIMONIAL/QUOTE SECTION
// =============================================================================
interface QuoteProps {
  quote: string;
  author?: string;
  role?: string;
}

export const QuoteSection: React.FC<QuoteProps> = ({ quote, author, role }) => (
  <Box
    component="section"
    sx={{
      py: { xs: 10, md: 14 },
      bgcolor: '#fbbf24',
    }}
  >
    <Container maxWidth="md">
      <Typography
        sx={{
          fontSize: { xs: '1.5rem', md: '2rem' },
          fontWeight: 600,
          textAlign: 'center',
          color: '#0f172a',
          fontStyle: 'italic',
          lineHeight: 1.5,
          mb: author ? 4 : 0,
        }}
      >
        "{quote}"
      </Typography>
      {author && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            sx={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#0f172a',
            }}
          >
            {author}
          </Typography>
          {role && (
            <Typography
              sx={{
                fontSize: '0.9375rem',
                color: '#78350f',
              }}
            >
              {role}
            </Typography>
          )}
        </Box>
      )}
    </Container>
  </Box>
);

// =============================================================================
// FINAL CTA SECTION
// =============================================================================
export const FinalCTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 12, md: 16 },
        bgcolor: '#0f172a',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '2rem', md: '2.75rem' },
            fontWeight: 700,
            textAlign: 'center',
            mb: 3,
            color: 'white',
          }}
        >
          Ready to Transform Your Sales Outreach?
        </Typography>
        <Typography
          sx={{
            fontSize: '1.125rem',
            textAlign: 'center',
            mb: 5,
            color: '#94a3b8',
            maxWidth: '500px',
            mx: 'auto',
          }}
        >
          Create your first AI-powered sales pitch in minutes. No credit card required.
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/admin/audio-generator/new')}
            endIcon={<ArrowRight size={20} />}
            sx={{
              bgcolor: '#fbbf24',
              color: '#0f172a',
              fontWeight: 700,
              fontSize: '1.125rem',
              px: 5,
              py: 2,
              borderRadius: '12px',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#f59e0b',
              },
            }}
          >
            Create Your Pitch
          </Button>
        </Box>

        {/* Trust indicators */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 4,
            mt: 6,
            flexWrap: 'wrap',
          }}
        >
          {['No credit card', 'Free to start', 'Ready in minutes'].map((text) => (
            <Box
              key={text}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CheckCircle size={18} color="#22c55e" />
              <Typography sx={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
