import React from 'react';
import { Box, Typography } from '@mui/material';
import { Question } from '../../../audio-generator/types/audio.types';
import { TextInput } from './QuestionTypes/TextInput';
import { TextArea } from './QuestionTypes/TextArea';
import { Select } from './QuestionTypes/Select';
import { MultiSelect } from './QuestionTypes/MultiSelect';

interface WizardQuestionProps {
  question: Question;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

export const WizardQuestion: React.FC<WizardQuestionProps> = ({
  question,
  value,
  onChange,
}) => {
  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <TextInput
            value={value as string}
            onChange={onChange}
            placeholder={question.placeholder}
          />
        );
      case 'textarea':
        return (
          <TextArea
            value={value as string}
            onChange={onChange}
            placeholder={question.placeholder}
          />
        );
      case 'select':
        return (
          <Select
            value={value as string}
            onChange={onChange}
            options={question.options || []}
          />
        );
      case 'multiselect':
        return (
          <MultiSelect
            value={Array.isArray(value) ? value : []}
            onChange={onChange}
            options={question.options || []}
          />
        );
      default:
        return null;
    }
  };

  // Check if answer is empty
  const isEmpty = Array.isArray(value) ? value.length === 0 : !value || value.trim() === '';

  return (
    <Box sx={{ mb: 4 }}>
      {/* Question */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography
          sx={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#1e293b',
          }}
        >
          {question.question}
        </Typography>
        <Typography
          component="span"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: isEmpty ? '#ef4444' : '#22c55e',
            bgcolor: isEmpty ? '#fef2f2' : '#f0fdf4',
            px: 1,
            py: 0.25,
            borderRadius: 1,
          }}
        >
          {isEmpty ? 'Required' : '✓'}
        </Typography>
      </Box>

      {/* Help text */}
      <Typography
        sx={{
          fontSize: '0.875rem',
          color: '#94a3b8',
          mb: 3,
          fontStyle: 'italic',
        }}
      >
        {question.helpText}
      </Typography>

      {/* Input */}
      {renderInput()}
    </Box>
  );
};
