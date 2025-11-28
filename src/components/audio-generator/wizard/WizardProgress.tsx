import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { getSectionInfo } from '../../../audio-generator/questions';
import { Question } from '../../../audio-generator/types/audio.types';

interface WizardProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  currentQuestionData: Question | undefined;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentQuestion,
  totalQuestions,
  currentQuestionData,
}) => {
  const progress = (currentQuestion / totalQuestions) * 100;
  const sectionInfo = currentQuestionData ? getSectionInfo(currentQuestionData) : null;

  return (
    <Box sx={{ mb: 4 }}>
      {/* Section badge */}
      {sectionInfo && (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: 2,
            py: 0.5,
            borderRadius: '20px',
            bgcolor: `${sectionInfo.color}15`,
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: sectionInfo.color,
              mr: 1,
            }}
          />
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: sectionInfo.color,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {sectionInfo.title}
          </Typography>
        </Box>
      )}

      {/* Progress bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: '#e2e8f0',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: sectionInfo?.color || '#fbbf24',
              },
            }}
          />
        </Box>
        <Typography
          sx={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#64748b',
            minWidth: 50,
          }}
        >
          {currentQuestion}/{totalQuestions}
        </Typography>
      </Box>
    </Box>
  );
};
