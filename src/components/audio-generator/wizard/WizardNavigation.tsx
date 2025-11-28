import React from 'react';
import { Box, Button } from '@mui/material';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface WizardNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  isCurrentAnswerValid: boolean;
  onBack: () => void;
  onNext: () => void;
  onComplete: () => void;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  currentQuestion,
  totalQuestions,
  isCurrentAnswerValid,
  onBack,
  onNext,
  onComplete,
}) => {
  const isLastQuestion = currentQuestion === totalQuestions;
  const isFirstQuestion = currentQuestion === 1;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pt: 4,
        mt: 4,
        borderTop: '1px solid #e2e8f0',
      }}
    >
      {/* Back button */}
      <Button
        onClick={onBack}
        disabled={isFirstQuestion}
        startIcon={<ArrowLeft size={18} />}
        sx={{
          px: 3,
          py: 1.25,
          color: '#64748b',
          fontWeight: 500,
          textTransform: 'none',
          visibility: isFirstQuestion ? 'hidden' : 'visible',
          '&:hover': {
            bgcolor: '#f1f5f9',
          },
        }}
      >
        Back
      </Button>

      {/* Next/Generate button */}
      {isLastQuestion ? (
        <Button
          onClick={onComplete}
          disabled={!isCurrentAnswerValid}
          variant="contained"
          startIcon={<Sparkles size={18} />}
          sx={{
            px: 4,
            py: 1.5,
            bgcolor: '#fbbf24',
            color: '#000',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '10px',
            boxShadow: '0 4px 14px rgba(251, 191, 36, 0.3)',
            '&:hover': {
              bgcolor: '#f59e0b',
              boxShadow: '0 6px 20px rgba(251, 191, 36, 0.4)',
            },
            '&:disabled': {
              bgcolor: '#e2e8f0',
              color: '#94a3b8',
            },
          }}
        >
          Generate My Script
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={!isCurrentAnswerValid}
          variant="contained"
          endIcon={<ArrowRight size={18} />}
          sx={{
            px: 4,
            py: 1.5,
            bgcolor: '#fbbf24',
            color: '#000',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '10px',
            boxShadow: '0 4px 14px rgba(251, 191, 36, 0.3)',
            '&:hover': {
              bgcolor: '#f59e0b',
              boxShadow: '0 6px 20px rgba(251, 191, 36, 0.4)',
            },
            '&:disabled': {
              bgcolor: '#e2e8f0',
              color: '#94a3b8',
            },
          }}
        >
          Next
        </Button>
      )}
    </Box>
  );
};
