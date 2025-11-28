import React, { useState, useRef } from 'react';
import { Box, Typography, Container, Button, Paper } from '@mui/material';
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
// AUDIO VISUALIZER - Animated bars when playing
// =============================================================================
const AudioVisualizer: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  const bars = [
    { delay: '0s', height: '60%' },
    { delay: '0.2s', height: '80%' },
    { delay: '0.4s', height: '100%' },
    { delay: '0.1s', height: '70%' },
    { delay: '0.3s', height: '90%' },
    { delay: '0.5s', height: '65%' },
    { delay: '0.15s', height: '85%' },
    { delay: '0.35s', height: '75%' },
    { delay: '0.25s', height: '95%' },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        height: 60,
        mt: 3,
        opacity: isPlaying ? 1 : 0.3,
        transition: 'opacity 0.3s ease',
      }}
    >
      {bars.map((bar, index) => (
        <Box
          key={index}
          sx={{
            width: { xs: 4, md: 6 },
            height: bar.height,
            bgcolor: '#fbbf24',
            borderRadius: '4px',
            animation: isPlaying ? `audioBar 0.8s ease-in-out infinite` : 'none',
            animationDelay: bar.delay,
            transform: isPlaying ? 'scaleY(1)' : 'scaleY(0.3)',
            transformOrigin: 'bottom',
            transition: 'transform 0.3s ease',
            '@keyframes audioBar': {
              '0%, 100%': { transform: 'scaleY(0.3)' },
              '50%': { transform: 'scaleY(1)' },
            },
          }}
        />
      ))}
    </Box>
  );
};

// =============================================================================
// HERO SECTION
// =============================================================================
export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          setAudioError(null);
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Audio playback error:', error);
        setAudioError('Unable to play audio. Please try again.');
        setIsPlaying(false);
      }
    }
  };

  const handleAudioEnded = () => setIsPlaying(false);
  const handleAudioError = () => {
    setAudioError('Audio file could not be loaded.');
    setIsPlaying(false);
  };

  return (
    <Box
      component="section"
      sx={{
        pt: { xs: 14, md: 20 },
        pb: { xs: 10, md: 16 },
        bgcolor: '#f8fafc',
        background: `
          radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.06) 1px, transparent 0px),
          linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)
        `,
        backgroundSize: '20px 20px, 100% 100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
            fontWeight: 800,
            mb: 2,
            color: '#0f172a',
            letterSpacing: '-0.02em',
          }}
        >
          Cold Pitch
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: '1.125rem', sm: '1.25rem' },
            mb: 6,
            color: '#475569',
          }}
        >
          AI-powered sales scripts with professional audio.
          <br />
          Perfect for cold calls, voicemail drops, and sales training.
        </Typography>

        {/* Play Button */}
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
            mx: 'auto',
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

        <audio
          ref={audioRef}
          src="/assets/cold-pitch.mp3"
          onEnded={handleAudioEnded}
          onError={handleAudioError}
          preload="auto"
        />

        <AudioVisualizer isPlaying={isPlaying} />

        <Typography
          sx={{
            mt: 2,
            mb: 6,
            fontSize: '0.875rem',
            color: audioError ? '#ef4444' : '#64748b',
          }}
        >
          {audioError || (isPlaying ? 'Now playing demo...' : 'Hear what Cold Pitch can create for you')}
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/admin/audio-generator/new')}
          endIcon={<ArrowRight size={20} />}
          sx={{
            bgcolor: '#0f172a',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.125rem',
            px: 5,
            py: 2,
            borderRadius: '12px',
            textTransform: 'none',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
            '&:hover': { bgcolor: '#1e293b' },
          }}
        >
          Get Started Free
        </Button>
      </Container>
    </Box>
  );
};

// =============================================================================
// USE CASES SECTION
// =============================================================================
const useCases = [
  { icon: Voicemail, title: 'Voicemail Drops', description: 'Pre-record professional voicemails that get callbacks. Drop them into any dialer system.', color: '#8b5cf6' },
  { icon: Users, title: 'Sales Training', description: 'Create consistent training materials. Let new reps learn from AI-perfected pitch scripts.', color: '#06b6d4' },
  { icon: Phone, title: 'Cold Calling Scripts', description: 'Generate proven cold call scripts tailored to your product and target audience.', color: '#10b981' },
  { icon: Presentation, title: 'Presentations', description: 'Add professional voiceovers to sales decks and video presentations.', color: '#f59e0b' },
];

export const UseCasesSection: React.FC = () => (
  <Box component="section" sx={{ py: { xs: 10, md: 14 }, bgcolor: '#f8fafc' }}>
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, mb: 2, color: '#1e293b' }}>
          Built for Sales Professionals
        </Typography>
        <Typography sx={{ fontSize: '1.125rem', color: '#64748b', maxWidth: '500px', mx: 'auto' }}>
          From SDRs to sales managers, Cold Pitch helps teams close more deals
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
        }}
      >
        {useCases.map((useCase) => (
          <Paper
            key={useCase.title}
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '16px',
              bgcolor: 'white',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px -8px rgba(0,0,0,0.1)' },
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                bgcolor: `${useCase.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <useCase.icon size={32} color={useCase.color} />
            </Box>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 1.5, color: '#1e293b' }}>
              {useCase.title}
            </Typography>
            <Typography sx={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.6 }}>
              {useCase.description}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Container>
  </Box>
);

// =============================================================================
// HOW IT WORKS SECTION
// =============================================================================
const steps = [
  { number: '01', title: 'Answer 8 Questions', description: 'Tell us about your product, target audience, and desired tone. Takes less than 2 minutes.', icon: FileText },
  { number: '02', title: 'AI Generates Your Script', description: 'Our AI crafts a professional sales script tailored to your specific needs.', icon: Zap },
  { number: '03', title: 'Get Professional Audio', description: 'Convert your script to studio-quality audio with natural-sounding AI voices.', icon: Headphones },
];

export const HowItWorksSection: React.FC = () => (
  <Box component="section" id="how-it-works" sx={{ py: { xs: 10, md: 14 }, bgcolor: 'white', scrollMarginTop: '80px' }}>
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, mb: 2, color: '#1e293b' }}>
          How It Works
        </Typography>
        <Typography sx={{ fontSize: '1.125rem', color: '#64748b', maxWidth: '500px', mx: 'auto' }}>
          From idea to professional audio in minutes
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 4,
        }}
      >
        {steps.map((step) => (
          <Box
            key={step.number}
            sx={{
              p: 4,
              borderRadius: '16px',
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <Typography
              sx={{
                fontSize: '5rem',
                fontWeight: 800,
                color: '#fbbf24',
                opacity: 0.2,
                position: 'absolute',
                top: 8,
                right: 16,
                lineHeight: 1,
              }}
            >
              {step.number}
            </Typography>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                bgcolor: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <step.icon size={28} color="#0f172a" />
            </Box>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 1.5, color: '#1e293b' }}>
              {step.title}
            </Typography>
            <Typography sx={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.6 }}>
              {step.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </Container>
  </Box>
);

// =============================================================================
// FEATURES SECTION
// =============================================================================
const features = [
  { icon: Clock, title: 'Save Hours Every Week', description: 'Stop writing scripts from scratch. Generate professional pitches in minutes.' },
  { icon: Target, title: 'Higher Response Rates', description: 'AI-optimized scripts are designed to capture attention and drive action.' },
  { icon: Mic, title: 'Studio-Quality Audio', description: 'ElevenLabs-powered voices that sound natural and professional.' },
  { icon: Users, title: 'Consistent Messaging', description: 'Keep your entire sales team on the same page with standardized scripts.' },
];

export const FeaturesSection: React.FC = () => (
  <Box component="section" id="features" sx={{ py: { xs: 10, md: 14 }, bgcolor: '#0f172a', scrollMarginTop: '80px' }}>
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, mb: 2, color: 'white' }}>
          Why Sales Teams Love Cold Pitch
        </Typography>
        <Typography sx={{ fontSize: '1.125rem', color: '#94a3b8', maxWidth: '500px', mx: 'auto' }}>
          The fastest way to create professional sales content
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3,
        }}
      >
        {features.map((feature) => (
          <Box
            key={feature.title}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 3,
              p: 4,
              borderRadius: '16px',
              bgcolor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                bgcolor: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <feature.icon size={28} color="#0f172a" />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, mb: 1, color: 'white' }}>
                {feature.title}
              </Typography>
              <Typography sx={{ fontSize: '0.9375rem', color: '#94a3b8', lineHeight: 1.6 }}>
                {feature.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Container>
  </Box>
);

// =============================================================================
// QUOTE SECTION
// =============================================================================
interface QuoteProps {
  quote: string;
  author?: string;
  role?: string;
}

export const QuoteSection: React.FC<QuoteProps> = ({ quote, author, role }) => (
  <Box component="section" sx={{ py: { xs: 10, md: 14 }, bgcolor: '#fbbf24' }}>
    <Container maxWidth="md" sx={{ textAlign: 'center' }}>
      <Typography
        sx={{
          fontSize: { xs: '1.5rem', md: '2rem' },
          fontWeight: 600,
          color: '#0f172a',
          fontStyle: 'italic',
          lineHeight: 1.5,
          mb: author ? 4 : 0,
        }}
      >
        "{quote}"
      </Typography>
      {author && (
        <Box>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>
            {author}
          </Typography>
          {role && (
            <Typography sx={{ fontSize: '0.9375rem', color: '#78350f' }}>
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

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, fontWeight: 700, mb: 3, color: 'white' }}>
          Ready to Transform Your Sales Outreach?
        </Typography>
        <Typography sx={{ fontSize: '1.125rem', mb: 5, color: '#94a3b8' }}>
          Create your first AI-powered sales pitch in minutes. No credit card required.
        </Typography>

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
            '&:hover': { bgcolor: '#f59e0b' },
          }}
        >
          Create Your Pitch
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 6, flexWrap: 'wrap' }}>
          {['No credit card', 'Free to start', 'Ready in minutes'].map((text) => (
            <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle size={18} color="#22c55e" />
              <Typography sx={{ fontSize: '0.875rem', color: '#94a3b8' }}>{text}</Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
