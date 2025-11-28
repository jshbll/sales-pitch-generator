import { Question } from './types/audio.types';

/**
 * Quick Pitch Intake - 8 Questions
 * Enough to generate cold calls, elevator pitches, and DMs
 */
export const QUESTIONS: Question[] = [
  // Question 1 - WHO
  {
    id: 'who',
    section: 'Target',
    question: 'WHO do you sell to?',
    helpText: 'Job title, industry — be specific',
    type: 'textarea',
    placeholder: 'e.g., Real estate wholesalers doing 2-10 deals/month',
    required: true,
  },

  // Question 2 - PAIN
  {
    id: 'pain',
    section: 'Problem',
    question: 'WHAT frustrates them right now?',
    helpText: 'Use their words if you can',
    type: 'textarea',
    placeholder: 'e.g., "Disposition is killing me" — matching deals to buyers is slow and manual',
    required: true,
  },

  // Question 3 - CURRENT FIX
  {
    id: 'currentFix',
    section: 'Problem',
    question: 'WHAT are they currently doing about it — and why does it suck?',
    helpText: 'The status quo they\'re stuck with',
    type: 'textarea',
    placeholder: 'e.g., Spreadsheets, mass texts, blasting their whole list. Deals die waiting.',
    required: true,
  },

  // Question 4 - WHAT YOU DO
  {
    id: 'whatYouDo',
    section: 'Solution',
    question: 'WHAT do you do? (One sentence, no jargon)',
    helpText: 'Keep it simple enough for a 5th grader',
    type: 'textarea',
    placeholder: 'e.g., Instant deal-to-buyer matching with real-time notifications',
    required: true,
  },

  // Question 5 - HOW IT WORKS
  {
    id: 'howItWorks',
    section: 'Solution',
    question: 'HOW does it work? (2-3 steps max)',
    helpText: 'The simple process',
    type: 'textarea',
    placeholder: 'e.g., Upload deal → buyers have preferences saved → matching buyers get notified instantly',
    required: true,
  },

  // Question 6 - WHY YOU
  {
    id: 'whyYou',
    section: 'Trust',
    question: 'WHY should they trust you over other options?',
    helpText: 'Your unique credibility or differentiator',
    type: 'textarea',
    placeholder: 'e.g., Built by someone who\'s actually wholesaled, not just developers. Everyone else focuses on finding deals — we focus on selling them.',
    required: true,
  },

  // Question 7 - THE ASK
  {
    id: 'theAsk',
    section: 'Action',
    question: 'WHAT do you want them to do after the pitch?',
    helpText: 'Book a call, try it free, reply, etc.',
    type: 'textarea',
    placeholder: 'e.g., Book a 15-minute call to see it live',
    required: true,
  },

  // Question 8 - LENGTH
  {
    id: 'pitchLength',
    section: 'Format',
    question: 'HOW long should the pitch be?',
    helpText: 'Choose the format that fits your use case',
    type: 'select',
    options: [
      { value: '30-second', label: '30 seconds' },
      { value: '60-second', label: '60 seconds' },
      { value: '2-minute', label: '2 minutes' },
    ],
    required: true,
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;

// Section colors for progress display
export const SECTION_COLORS: Record<string, string> = {
  'Target': '#f59e0b',
  'Problem': '#ef4444',
  'Solution': '#10b981',
  'Trust': '#3b82f6',
  'Action': '#8b5cf6',
  'Format': '#6366f1',
};

// Get section info from a question
export const getSectionInfo = (question: Question) => {
  return {
    title: question.section,
    color: SECTION_COLORS[question.section] || '#64748b',
  };
};
