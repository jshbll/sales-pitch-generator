import { useState, useCallback } from 'react';
import { WizardAnswers, WizardState } from '../types/audio.types';
import { QUESTIONS, TOTAL_QUESTIONS } from '../questions';

const STORAGE_KEY = 'audio-generator-wizard-state';

// Initialize empty answers for 8 questions
const getInitialAnswers = (): WizardAnswers => ({
  who: '',
  pain: '',
  currentFix: '',
  whatYouDo: '',
  howItWorks: '',
  whyYou: '',
  theAsk: '',
  pitchLength: '',
});

// Load state from localStorage
const loadSavedState = (): WizardState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load wizard state:', e);
  }
  return null;
};

// Save state to localStorage
const saveState = (state: WizardState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save wizard state:', e);
  }
};

export const useWizard = () => {
  // Initialize from localStorage or default
  const [state, setState] = useState<WizardState>(() => {
    const saved = loadSavedState();
    if (saved) {
      // Validate saved state has correct answer keys
      const hasValidAnswers = saved.answers && 'who' in saved.answers;
      if (hasValidAnswers) {
        return saved;
      }
    }
    return {
      currentQuestion: 0, // 0-indexed now
      answers: getInitialAnswers(),
      isComplete: false,
    };
  });

  // Get current question data (0-indexed)
  const currentQuestionData = QUESTIONS[state.currentQuestion];

  // Get current answer value
  const getCurrentAnswer = useCallback(() => {
    if (!currentQuestionData) return '';
    const key = currentQuestionData.id as keyof WizardAnswers;
    return state.answers[key] || '';
  }, [state.answers, currentQuestionData]);

  // Update answer for current question
  const updateAnswer = useCallback((value: string | string[]) => {
    if (!currentQuestionData) return;

    setState((prev) => {
      const key = currentQuestionData.id as keyof WizardAnswers;
      const newState = {
        ...prev,
        answers: {
          ...prev.answers,
          [key]: value,
        },
      };
      saveState(newState);
      return newState;
    });
  }, [currentQuestionData]);

  // Go to next question
  const goNext = useCallback(() => {
    setState((prev) => {
      if (prev.currentQuestion >= TOTAL_QUESTIONS - 1) {
        const newState = { ...prev, isComplete: true };
        saveState(newState);
        return newState;
      }
      const newState = { ...prev, currentQuestion: prev.currentQuestion + 1 };
      saveState(newState);
      return newState;
    });
  }, []);

  // Go to previous question
  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.currentQuestion <= 0) return prev;
      const newState = { ...prev, currentQuestion: prev.currentQuestion - 1 };
      saveState(newState);
      return newState;
    });
  }, []);

  // Go to specific question (0-indexed)
  const goToQuestion = useCallback((questionIndex: number) => {
    setState((prev) => {
      if (questionIndex < 0 || questionIndex >= TOTAL_QUESTIONS) return prev;
      const newState = { ...prev, currentQuestion: questionIndex, isComplete: false };
      saveState(newState);
      return newState;
    });
  }, []);

  // Reset wizard
  const reset = useCallback(() => {
    const newState: WizardState = {
      currentQuestion: 0,
      answers: getInitialAnswers(),
      isComplete: false,
    };
    localStorage.removeItem(STORAGE_KEY);
    setState(newState);
  }, []);

  // Check if current answer is valid (non-empty)
  const isCurrentAnswerValid = useCallback(() => {
    const answer = getCurrentAnswer();
    if (Array.isArray(answer)) {
      return answer.length > 0;
    }
    return typeof answer === 'string' && answer.trim().length > 0;
  }, [getCurrentAnswer]);

  // Calculate progress percentage
  const progressPercentage = ((state.currentQuestion + 1) / TOTAL_QUESTIONS) * 100;

  return {
    // State (convert to 1-indexed for display)
    currentQuestion: state.currentQuestion + 1,
    currentQuestionData,
    answers: state.answers,
    isComplete: state.isComplete,
    totalQuestions: TOTAL_QUESTIONS,
    progressPercentage,

    // Actions
    getCurrentAnswer,
    updateAnswer,
    goNext,
    goBack,
    goToQuestion,
    reset,
    isCurrentAnswerValid,
  };
};
