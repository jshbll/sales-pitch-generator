// Question types for the wizard
export type QuestionType = 'text' | 'textarea' | 'select' | 'multiselect';

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  section: string;
  question: string;
  helpText: string;
  type: QuestionType;
  placeholder?: string;
  options?: QuestionOption[];
  required?: boolean;
}

// Answer keys for the 8 questions
export interface WizardAnswers {
  who: string;           // Q1 - Who do you sell to?
  pain: string;          // Q2 - What frustrates them?
  currentFix: string;    // Q3 - Current solution & why it sucks
  whatYouDo: string;     // Q4 - What do you do?
  howItWorks: string;    // Q5 - How does it work?
  whyYou: string;        // Q6 - Why trust you?
  theAsk: string;        // Q7 - What should they do?
  pitchLength: string;   // Q8 - How long?
}

// Map question ID to answer key
export const questionIdToAnswerKey: Record<string, keyof WizardAnswers> = {
  'who': 'who',
  'pain': 'pain',
  'currentFix': 'currentFix',
  'whatYouDo': 'whatYouDo',
  'howItWorks': 'howItWorks',
  'whyYou': 'whyYou',
  'theAsk': 'theAsk',
  'pitchLength': 'pitchLength',
};

// Wizard state
export interface WizardState {
  currentQuestion: number;
  answers: WizardAnswers;
  isComplete: boolean;
}

// Generation status
export type GenerationStatus =
  | 'draft'
  | 'script_generating'
  | 'script_ready'
  | 'preview_generating'
  | 'preview_ready'
  | 'hq_generating'
  | 'hq_ready'
  | 'failed';

// Audio generation record
export interface AudioGeneration {
  _id: string;
  user_id: string;
  business_id?: string;
  answers: WizardAnswers;
  prompt: string;
  script_text: string;
  preview_url?: string;
  preview_duration?: number;
  hq_url?: string;
  hq_duration?: number;
  voice: string;
  model: string;
  status: GenerationStatus;
  created_at: number;
  updated_at: number;
}

// Voice options for ElevenLabs TTS
export const VOICE_OPTIONS = [
  // Custom voice first
  { value: 'custom', label: 'Custom Voice', description: 'Your cloned voice' },
  // Male voices
  { value: 'drew', label: 'Drew', description: 'Confident, professional' },
  { value: 'clyde', label: 'Clyde', description: 'Deep, authoritative' },
  { value: 'paul', label: 'Paul', description: 'News anchor style' },
  { value: 'dave', label: 'Dave', description: 'Casual, friendly' },
  { value: 'fin', label: 'Fin', description: 'Confident sales voice' },
  { value: 'antoni', label: 'Antoni', description: 'Well-rounded, clear' },
  { value: 'thomas', label: 'Thomas', description: 'Calm, narrative' },
  { value: 'charlie', label: 'Charlie', description: 'Casual, Australian' },
  { value: 'george', label: 'George', description: 'Warm, British' },
  { value: 'liam', label: 'Liam', description: 'Articulate, American' },
  // Female voices
  { value: 'rachel', label: 'Rachel', description: 'Warm, conversational' },
  { value: 'domi', label: 'Domi', description: 'Strong, assertive' },
  { value: 'sarah', label: 'Sarah', description: 'Soft, calm' },
  { value: 'emily', label: 'Emily', description: 'Calm, American' },
  { value: 'elli', label: 'Elli', description: 'Young, American' },
] as const;

export type VoiceOption = typeof VOICE_OPTIONS[number]['value'];
