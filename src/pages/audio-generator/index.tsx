import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText, Volume2, ArrowRight } from 'lucide-react';

export const AudioGeneratorIndex: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8fafc',
        py: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="md">
        {/* Hero */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              bgcolor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <Sparkles size={32} color="#f59e0b" />
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#1e293b',
              mb: 2,
            }}
          >
            AI Sales Pitch Generator
          </Typography>

          <Typography
            sx={{
              fontSize: '1.125rem',
              color: '#64748b',
              maxWidth: 500,
              mx: 'auto',
              lineHeight: 1.7,
            }}
          >
            Answer 8 quick questions and let AI craft the perfect sales pitch for cold calls, elevator pitches, and DMs.
          </Typography>
        </Box>

        {/* Features */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
            mb: 6,
          }}
        >
          {[
            {
              icon: <FileText size={24} color="#3b82f6" />,
              title: '8 Quick Questions',
              description: 'Just the essentials to capture your pitch',
            },
            {
              icon: <Sparkles size={24} color="#8b5cf6" />,
              title: 'AI-Powered Script',
              description: 'GPT-4 generates conversational, compelling sales scripts',
            },
            {
              icon: <Volume2 size={24} color="#10b981" />,
              title: 'Text-to-Speech',
              description: 'Generate audio versions with OpenAI TTS voices',
            },
          ].map((feature, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: 'white',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  bgcolor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                {feature.icon}
              </Box>
              <Typography sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                {feature.title}
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#64748b' }}>
                {feature.description}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* CTA */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowRight size={20} />}
            onClick={() => navigate('/admin/audio-generator/new')}
            sx={{
              bgcolor: '#fbbf24',
              color: '#000',
              fontWeight: 600,
              textTransform: 'none',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              fontSize: '1rem',
              boxShadow: '0 4px 14px rgba(251, 191, 36, 0.3)',
              '&:hover': {
                bgcolor: '#f59e0b',
                boxShadow: '0 6px 20px rgba(251, 191, 36, 0.4)',
              },
            }}
          >
            Create Your Pitch
          </Button>

          <Typography sx={{ mt: 3, fontSize: '0.875rem', color: '#94a3b8' }}>
            Takes about 2-3 minutes to complete
          </Typography>
        </Box>

        {/* How it works */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mt: 6,
            borderRadius: 3,
            bgcolor: 'white',
            border: '1px solid #e2e8f0',
          }}
        >
          <Typography sx={{ fontWeight: 600, color: '#1e293b', mb: 3, textAlign: 'center' }}>
            How It Works
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            {[
              { step: '1', title: 'Answer Questions', desc: 'Tell us about your business' },
              { step: '2', title: 'AI Generates', desc: 'Script crafted for you' },
              { step: '3', title: 'Review & Edit', desc: 'Fine-tune if needed' },
              { step: '4', title: 'Generate Audio', desc: 'Download your pitch' },
            ].map((item) => (
              <Box key={item.step} sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: '#fef3c7',
                    color: '#f59e0b',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1,
                    fontSize: '0.875rem',
                  }}
                >
                  {item.step}
                </Box>
                <Typography sx={{ fontWeight: 500, color: '#1e293b', fontSize: '0.875rem' }}>
                  {item.title}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {item.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AudioGeneratorIndex;
