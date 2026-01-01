export interface PhraseReplacement {
  pattern: RegExp;
  replacement: string;
}

export const aggressivePhrases: PhraseReplacement[] = [
  {
    pattern: /\byou always\b/gi,
    replacement: "it sometimes happens that",
  },
  {
    pattern: /\byou never\b/gi,
    replacement: "it would be helpful if",
  },
  {
    pattern: /\bwhy can't you\b/gi,
    replacement: "would it be possible to",
  },
  {
    pattern: /\bwhy don't you\b/gi,
    replacement: "perhaps you could",
  },
  {
    pattern: /\bwhy didn't you\b/gi,
    replacement: "I was wondering if you had considered",
  },
  {
    pattern: /\bI told you\b/gi,
    replacement: "as I mentioned",
  },
  {
    pattern: /\bI already told you\b/gi,
    replacement: "as previously discussed",
  },
  {
    pattern: /\bthis is ridiculous\b/gi,
    replacement: "this is unexpected",
  },
  {
    pattern: /\bthis is unacceptable\b/gi,
    replacement: "this needs attention",
  },
  {
    pattern: /\bI'm sick of\b/gi,
    replacement: "I'd like to address",
  },
  {
    pattern: /\bI'm tired of\b/gi,
    replacement: "I'd appreciate if we could change",
  },
  {
    pattern: /\bI'm fed up with\b/gi,
    replacement: "I'd like to find a solution for",
  },
  {
    pattern: /\bwhat's wrong with you\b/gi,
    replacement: "could you help me understand",
  },
  {
    pattern: /\bare you serious\b/gi,
    replacement: "I'd like to clarify",
  },
  {
    pattern: /\byou should have\b/gi,
    replacement: "it might have helped to",
  },
  {
    pattern: /\byou need to\b/gi,
    replacement: "it would be beneficial to",
  },
  {
    pattern: /\byou have to\b/gi,
    replacement: "it would help if you could",
  },
  {
    pattern: /\byou must\b/gi,
    replacement: "I'd recommend",
  },
  {
    pattern: /\bfigure it out\b/gi,
    replacement: "work through the details",
  },
  {
    pattern: /\bget it together\b/gi,
    replacement: "organize things",
  },
  {
    pattern: /\bI don't care\b/gi,
    replacement: "I'm flexible on this",
  },
  {
    pattern: /\bI don't have time\b/gi,
    replacement: "my schedule is currently limited",
  },
  {
    pattern: /\bthat's not my job\b/gi,
    replacement: "that falls outside my current responsibilities",
  },
  {
    pattern: /\bthat's not my problem\b/gi,
    replacement: "I may not be the best person to address this",
  },
  {
    pattern: /\bobviously\b/gi,
    replacement: "as you may know",
  },
  {
    pattern: /\bclearly\b/gi,
    replacement: "it appears that",
  },
];
