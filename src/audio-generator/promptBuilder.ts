import { WizardAnswers } from './types/audio.types';

export function buildPrompt(answers: WizardAnswers): string {
  return `Write a ${answers.pitchLength} cold call / elevator pitch / LinkedIn DM using this info.

Style: Casual, like a phone call to a friend. Contractions, filler phrases ("So look," "Here's the thing"), rhetorical questions, short punchy sentences. No bullet points. Human, not scripted.

Goal: ${answers.theAsk}

---
WHO: ${answers.who}
PAIN: ${answers.pain}
CURRENT FIX & WHY IT SUCKS: ${answers.currentFix}
WHAT WE DO: ${answers.whatYouDo}
HOW IT WORKS: ${answers.howItWorks}
WHY US: ${answers.whyYou}
THE ASK: ${answers.theAsk}
---

Return ONLY the script text, ready to be read aloud. No headers, no formatting, no intro text.`;
}

// Calculate estimated cost based on script length selection
export function estimateCost(pitchLength: string): { preview: number; hq: number; chars: number } {
  // Rough character estimates by pitch length
  const charEstimates: Record<string, number> = {
    '30-second': 500,
    '60-second': 1000,
    '2-minute': 2000,
  };

  const chars = charEstimates[pitchLength] || 1000;

  // OpenAI TTS pricing: $0.015/1K chars (tts-1), $0.030/1K chars (tts-1-hd)
  const preview = (chars / 1000) * 0.015;
  const hq = (chars / 1000) * 0.03;

  return {
    preview: Math.round(preview * 100) / 100,
    hq: Math.round(hq * 100) / 100,
    chars,
  };
}
