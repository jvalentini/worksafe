export interface PhraseReplacement {
  pattern: RegExp;
  replacement: string;
}

export const passiveAggressivePhrases: PhraseReplacement[] = [
  {
    pattern: /\bper my last email\b/gi,
    replacement: "as I mentioned",
  },
  {
    pattern: /\bper my previous email\b/gi,
    replacement: "as I noted earlier",
  },
  {
    pattern: /\bas per my email\b/gi,
    replacement: "following up on my note",
  },
  {
    pattern: /\bas I already mentioned\b/gi,
    replacement: "to reiterate",
  },
  {
    pattern: /\bas I said before\b/gi,
    replacement: "to clarify",
  },
  {
    pattern: /\bas previously stated\b/gi,
    replacement: "as noted",
  },
  {
    pattern: /\bgoing forward\b/gi,
    replacement: "from now on",
  },
  {
    pattern: /\bjust to be clear\b/gi,
    replacement: "to ensure alignment",
  },
  {
    pattern: /\bI was under the impression\b/gi,
    replacement: "I understood that",
  },
  {
    pattern: /\bnot sure if you saw\b/gi,
    replacement: "following up on",
  },
  {
    pattern: /\bnot sure if you got\b/gi,
    replacement: "checking in on",
  },
  {
    pattern: /\bjust following up\b/gi,
    replacement: "checking in",
  },
  {
    pattern: /\bjust checking in\b/gi,
    replacement: "following up",
  },
  {
    pattern: /\bfriendly reminder\b/gi,
    replacement: "reminder",
  },
  {
    pattern: /\bgentle reminder\b/gi,
    replacement: "quick note",
  },
  {
    pattern: /\bkindly\b/gi,
    replacement: "please",
  },
  {
    pattern: /\bwith all due respect\b/gi,
    replacement: "I'd like to offer a different perspective",
  },
  {
    pattern: /\bno offense,? but\b/gi,
    replacement: "from my perspective",
  },
  {
    pattern: /\bnot to be rude,? but\b/gi,
    replacement: "I wanted to mention",
  },
  {
    pattern: /\bI find it interesting that\b/gi,
    replacement: "I noticed that",
  },
  {
    pattern: /\bthanks for finally\b/gi,
    replacement: "thank you for",
  },
  {
    pattern: /\bwhenever you get a chance\b/gi,
    replacement: "when you have time",
  },
  {
    pattern: /\bwhenever you have time\b/gi,
    replacement: "at your convenience",
  },
  {
    pattern: /\bI'll let you figure that out\b/gi,
    replacement: "please let me know if you need help",
  },
  {
    pattern: /\bthat's fine\b/gi,
    replacement: "that works",
  },
  {
    pattern: /\bwhatever you think\b/gi,
    replacement: "I trust your judgment",
  },
  {
    pattern: /\bif that's what you want\b/gi,
    replacement: "if you'd prefer that approach",
  },
];
