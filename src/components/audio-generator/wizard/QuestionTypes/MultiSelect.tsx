import React from 'react';
import { Box, Typography } from '@mui/material';
import { Check } from 'lucide-react';

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  value,
  onChange,
  options,
}) => {
  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <Box>
      <Typography
        sx={{
          fontSize: '0.75rem',
          color: '#94a3b8',
          mb: 1.5,
          fontWeight: 500,
        }}
      >
        Select all that apply
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1.5,
        }}
      >
        {options.map((option) => {
          const isSelected = value.includes(option);
          return (
            <Box
              key={option}
              onClick={() => toggleOption(option)}
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
                  fontSize: '0.9375rem',
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? '#92400e' : '#475569',
                }}
              >
                {option}
              </Typography>
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '6px',
                  border: '2px solid',
                  borderColor: isSelected ? '#fbbf24' : '#cbd5e1',
                  bgcolor: isSelected ? '#fbbf24' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                {isSelected && <Check size={12} color="white" strokeWidth={3} />}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
