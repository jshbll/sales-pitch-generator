import React from 'react';
import { TextField } from '@mui/material';

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  return (
    <TextField
      fullWidth
      multiline
      rows={4}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      variant="outlined"
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          bgcolor: '#f8fafc',
          '& fieldset': {
            borderColor: '#e2e8f0',
          },
          '&:hover fieldset': {
            borderColor: '#cbd5e1',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#fbbf24',
            borderWidth: 2,
          },
        },
        '& .MuiOutlinedInput-input': {
          py: 1.5,
          px: 2,
          fontSize: '1rem',
          lineHeight: 1.6,
        },
      }}
    />
  );
};
