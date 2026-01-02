import type { PhraseReplacement } from "./aggressive";

export const persuasionHedgingPhrases: PhraseReplacement[] = [
  {
    pattern: /\bi think we should\b/gi,
    replacement: "I recommend we",
  },
  {
    pattern: /\bi think\b/gi,
    replacement: "based on my analysis",
  },
  {
    pattern: /\bi believe\b/gi,
    replacement: "the evidence suggests",
  },
  {
    pattern: /\bi feel like\b/gi,
    replacement: "my assessment is",
  },
  {
    pattern: /\bin my opinion\b,?\s*we should\b/gi,
    replacement: "We should",
  },
  {
    pattern: /\bi guess\b/gi,
    replacement: "my understanding is",
  },
  {
    pattern: /\bmaybe we could\b/gi,
    replacement: "let's consider",
  },
  {
    pattern: /\bi could be wrong,?\s+but\s+/gi,
    replacement: "one perspective is ",
  },
  {
    pattern: /\bi might be wrong,?\s+but\s+/gi,
    replacement: "here's what I'm seeing: ",
  },
  {
    pattern: /\bi may be wrong,?\s+but\s+/gi,
    replacement: "based on what we know, ",
  },
  {
    pattern: /\bi might be wrong\b,?\s*/gi,
    replacement: "here's what I'm seeing: ",
  },
  {
    pattern: /\bi may be wrong\b,?\s*/gi,
    replacement: "based on what we know, ",
  },
];

export const persuasionApologyPhrases: PhraseReplacement[] = [
  {
    pattern: /\bsorry to bother you\b,?\s+but\s+/gi,
    replacement: "",
  },
  {
    pattern: /\bsorry to bother you\b[,.]?\s*/gi,
    replacement: "",
  },
  {
    pattern: /\bsorry,?\s+but\s+/gi,
    replacement: "however ",
  },
  {
    pattern: /\bI'm no expert,?\s+but\s+/gi,
    replacement: "based on my experience, ",
  },
  {
    pattern: /\bthis might be a stupid question,?\s+but\s+/gi,
    replacement: "to clarify, ",
  },
  {
    pattern: /\bthis might be a silly idea,?\s+but\s+/gi,
    replacement: "one approach to consider: ",
  },
  {
    pattern: /\bforgive me for asking\b,?\s+but\s+/gi,
    replacement: "I'd like to understand ",
  },
  {
    pattern: /\bforgive me for asking\b[,.]?\s*/gi,
    replacement: "I'd like to understand ",
  },
  {
    pattern: /\bI'm just saying\b[,.]?\s*/gi,
    replacement: "",
  },
];

export const persuasionQualifierPhrases: PhraseReplacement[] = [
  {
    pattern: /\bjust wanted to\b/gi,
    replacement: "I'm writing to",
  },
  {
    pattern: /\bjust my two cents\b[,:]?\s*/gi,
    replacement: "my recommendation is ",
  },
  {
    pattern: /\bi just think\b/gi,
    replacement: "I recommend",
  },
  {
    pattern: /\bactually,?\s+/gi,
    replacement: "",
  },
  {
    pattern: /\bkind of\b\s*/gi,
    replacement: "",
  },
  {
    pattern: /\bsort of\b\s*/gi,
    replacement: "",
  },
  {
    pattern: /\ba little bit\b\s*/gi,
    replacement: "",
  },
  {
    pattern: /\bbasically\b,?\s*/gi,
    replacement: "",
  },
  {
    pattern: /\bhonestly\b,?\s*/gi,
    replacement: "",
  },
  {
    pattern: /\bto be honest\b,?\s*/gi,
    replacement: "",
  },
  {
    pattern: /\bliterally\b,?\s*/gi,
    replacement: "",
  },
  {
    pattern: /\bvery good\b/gi,
    replacement: "excellent",
  },
  {
    pattern: /\bvery bad\b/gi,
    replacement: "unacceptable",
  },
  {
    pattern: /\bvery important\b/gi,
    replacement: "critical",
  },
  {
    pattern: /\bvery helpful\b/gi,
    replacement: "invaluable",
  },
];

export const persuasionCommitmentPhrases: PhraseReplacement[] = [
  {
    pattern: /\bI'll try to\b/gi,
    replacement: "I will",
  },
  {
    pattern: /\bi should be able to\b/gi,
    replacement: "I will",
  },
  {
    pattern: /\bhopefully\b,?\s*/gi,
    replacement: "the expectation is that ",
  },
  {
    pattern: /\bi was wondering if maybe you could\b/gi,
    replacement: "Could you",
  },
  {
    pattern: /\bwe're basically going to maybe try\b/gi,
    replacement: "Our plan is",
  },
];

export const persuasionValidationPhrases: PhraseReplacement[] = [
  {
    pattern: /\bdoes that make sense\b\??/gi,
    replacement: "let me know if you have questions",
  },
  {
    pattern: /\bdid that make sense\b\??/gi,
    replacement: "I'm happy to elaborate if helpful",
  },
  {
    pattern: /\bif that makes sense\b,?\s*/gi,
    replacement: "to summarize, ",
  },
  {
    pattern: /\s*,?\s*if that's (okay|ok)\b\.?/gi,
    replacement: "",
  },
  {
    pattern: /\s*,\s*right\?/gi,
    replacement: "",
  },
  {
    pattern: /\s*,\s*you know\?/gi,
    replacement: "",
  },
];

export const persuasionFollowUpPhrases: PhraseReplacement[] = [
  {
    pattern: /\bjust following up\b/gi,
    replacement: "following up",
  },
  {
    pattern: /\bjust checking in\b/gi,
    replacement: "following up",
  },
  {
    pattern: /\bhope you're well\b[.!]?\s*/gi,
    replacement: "",
  },
  {
    pattern: /\bi hope you're well\b[.!]?\s*/gi,
    replacement: "",
  },
  {
    pattern: /\bhappy to help with whatever you need\b[.!]?\s*/gi,
    replacement: "I can support this. What would be most useful?",
  },
  {
    pattern: /\bwhen you get a chance\b,?\s*/gi,
    replacement: "",
  },
  {
    pattern: /\bno worries if not\b[,.]?\s*/gi,
    replacement: "",
  },
  {
    pattern: /\bfeel free to\b/gi,
    replacement: "please",
  },
];
