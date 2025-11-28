import React, { useState } from 'react';
import { Box, Container, Paper, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useWizard } from '../../audio-generator/hooks/useWizard';
import { buildPrompt } from '../../audio-generator/promptBuilder';
import { WizardProgress, WizardQuestion, WizardNavigation, DevUsageTracker } from '../../components/audio-generator';

export const AudioWizard: React.FC = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    currentQuestion,
    currentQuestionData,
    answers,
    totalQuestions,
    getCurrentAnswer,
    updateAnswer,
    goNext,
    goBack,
    isCurrentAnswerValid,
  } = useWizard();

  // Convex mutations
  const createGeneration = useMutation(api.audioGenerator.create);

  const handleComplete = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Build the prompt from answers
      const prompt = buildPrompt(answers);

      // Create generation record
      const generationId = await createGeneration({
        answers,
        prompt,
        voice: 'alloy', // Default voice
      });

      // Navigate to preview page with the generation ID
      navigate(`/admin/audio-generator/${generationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create generation');
      setIsGenerating(false);
    }
  };

  if (!currentQuestionData) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8fafc',
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1e293b',
              mb: 1,
            }}
          >
            Sales Pitch Generator
          </Typography>
          <Typography
            sx={{
              color: '#64748b',
              fontSize: '1rem',
            }}
          >
            Answer 8 quick questions to generate your sales pitch
          </Typography>
        </Box>

        {/* Wizard Card */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            bgcolor: 'white',
            border: '1px solid #e2e8f0',
          }}
        >
          {/* Progress */}
          <WizardProgress
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
            currentQuestionData={currentQuestionData}
          />

          {/* Question */}
          <WizardQuestion
            question={currentQuestionData}
            value={getCurrentAnswer()}
            onChange={updateAnswer}
          />

          {/* Error message */}
          {error && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#fef2f2',
                border: '1px solid #fecaca',
                mb: 3,
              }}
            >
              <Typography sx={{ color: '#dc2626', fontSize: '0.875rem' }}>
                {error}
              </Typography>
            </Box>
          )}

          {/* Navigation */}
          {isGenerating ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress
                  size={40}
                  sx={{ color: '#fbbf24', mb: 2 }}
                />
                <Typography sx={{ color: '#64748b' }}>
                  Creating your pitch...
                </Typography>
              </Box>
            </Box>
          ) : (
            <WizardNavigation
              currentQuestion={currentQuestion}
              totalQuestions={totalQuestions}
              isCurrentAnswerValid={isCurrentAnswerValid()}
              onBack={goBack}
              onNext={goNext}
              onComplete={handleComplete}
            />
          )}
        </Paper>

        {/* Tips */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography
            sx={{
              color: '#94a3b8',
              fontSize: '0.875rem',
              fontStyle: 'italic',
            }}
          >
            Tip: Be specific and use your customer's language for best results
          </Typography>
        </Box>
      </Container>

      {/* Dev usage tracker - only shows in development */}
      <DevUsageTracker />
    </Box>
  );
};

export default AudioWizard;
