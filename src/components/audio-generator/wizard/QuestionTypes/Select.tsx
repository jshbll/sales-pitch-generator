import React from 'react';
import { Box, Typography } from '@mui/material';
import { Check } from 'lucide-react';
import { QuestionOption } from '../../../../audio-generator/types/audio.types';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: QuestionOption[];
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <Box
            key={option.value}
            onClick={() => onChange(option.value)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderRadius: '12px',
              border: '2px solid',
              borderColor: isSelected ? '#fbbf24' : '#e2e8f0',
              bgcolor: isSelected ? '#fef3c7' : '#f8fafc',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: isSelected ? '#fbbf24' : '#cbd5e1',
                bgcolor: isSelected ? '#fef3c7' : '#f1f5f9',
              },
            }}
          >
            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? '#92400e' : '#475569',
              }}
            >
              {option.label}
            </Typography>
            {isSelected && (
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check size={14} color="white" strokeWidth={3} />
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
