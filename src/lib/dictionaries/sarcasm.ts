export interface PhraseReplacement {
  pattern: RegExp;
  replacement: string;
}

export const sarcasmPhrases: PhraseReplacement[] = [
  {
    pattern: /\boh,?\s+great\.{2,}/gi,
    replacement: "this is concerning",
  },
  {
    pattern: /\boh,?\s+wonderful\.{2,}/gi,
    replacement: "I have concerns about this",
  },
  {
    pattern: /\bwow,?\s+brilliant\.{2,}/gi,
    replacement: "I'd like to discuss this approach",
  },
  {
    pattern: /\byeah,?\s+sure\.{2,}/gi,
    replacement: "I understand",
  },
  {
    pattern: /\breal genius\b/gi,
    replacement: "an interesting approach",
  },
  {
    pattern: /\bthanks for nothing\b/gi,
    replacement: "I would have appreciated more support",
  },
  {
    pattern: /\bthat'?s just perfect\.{2,}/gi,
    replacement: "I have some concerns about this",
  },
  {
    pattern: /\bhow convenient\.{2,}/gi,
    replacement: "I notice the timing of this",
  },
  {
    pattern: /\bfascinating\.{2,}/gi,
    replacement: "I'd like to understand this better",
  },
  {
    pattern: /\bhow original\.{2,}/gi,
    replacement: "this seems familiar",
  },
  {
    pattern: /\bwell done\.{2,}/gi,
    replacement: "let's review this",
  },
  {
    pattern: /\bslow clap\b/gi,
    replacement: "I have feedback on this",
  },
  {
    pattern: /\bgood luck with that\.{2,}/gi,
    replacement: "that approach may be challenging",
  },
  {
    pattern: /\bsounds like a plan\.{2,}/gi,
    replacement: "I have concerns about this plan",
  },
  {
    pattern: /\bcouldn'?t be happier\.{2,}/gi,
    replacement: "I'm not satisfied with this",
  },
];
