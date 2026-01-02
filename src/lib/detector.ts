import {
  englishDataset,
  englishRecommendedTransformers,
  RegExpMatcher,
} from "obscenity";
import {
  aggressivePhrases,
  type PhraseReplacement,
} from "./dictionaries/aggressive";
import { insultReplacements } from "./dictionaries/insults";
import { passiveAggressivePhrases } from "./dictionaries/passive-aggressive";
import {
  persuasionApologyPhrases,
  persuasionCommitmentPhrases,
  persuasionFollowUpPhrases,
  persuasionHedgingPhrases,
  persuasionQualifierPhrases,
  persuasionValidationPhrases,
} from "./dictionaries/persuasion";
import { profanityReplacements } from "./dictionaries/profanity";

export interface Detection {
  type:
    | "profanity"
    | "insult"
    | "aggressive"
    | "passive-aggressive"
    | "persuasion-hedging"
    | "persuasion-apologies"
    | "persuasion-qualifiers"
    | "persuasion-commitments"
    | "persuasion-validation"
    | "persuasion-followups";
  original: string;
  replacement: string;
  startIndex: number;
  endIndex: number;
}

const baseDataset = englishDataset.build();

const extraWhitelistedTerms = [
  "assess",
  "assessed",
  "assesses",
  "assessing",
  "assessment",
  "assessments",
  "assessor",
  "assessors",
];

const obscenityMatcher = new RegExpMatcher({
  ...baseDataset,
  ...englishRecommendedTransformers,
  whitelistedTerms: [
    ...(baseDataset.whitelistedTerms ?? []),
    ...extraWhitelistedTerms,
  ],
});

const allWordReplacements: Record<string, string> = {
  ...profanityReplacements,
  ...insultReplacements,
};

const allWordKeys = Object.keys(allWordReplacements).toSorted(
  (a, b) => b.length - a.length,
);

const phraseGroups: Array<{
  type: Detection["type"];
  phrases: PhraseReplacement[];
}> = [
  { type: "aggressive", phrases: aggressivePhrases },
  { type: "passive-aggressive", phrases: passiveAggressivePhrases },
  { type: "persuasion-hedging", phrases: persuasionHedgingPhrases },
  { type: "persuasion-apologies", phrases: persuasionApologyPhrases },
  { type: "persuasion-qualifiers", phrases: persuasionQualifierPhrases },
  { type: "persuasion-commitments", phrases: persuasionCommitmentPhrases },
  { type: "persuasion-validation", phrases: persuasionValidationPhrases },
  { type: "persuasion-followups", phrases: persuasionFollowUpPhrases },
];

const detectionTypePriority: Record<Detection["type"], number> = {
  aggressive: 0,
  "passive-aggressive": 1,
  "persuasion-hedging": 2,
  "persuasion-apologies": 3,
  "persuasion-qualifiers": 4,
  "persuasion-commitments": 5,
  "persuasion-validation": 6,
  "persuasion-followups": 7,
  profanity: 8,
  insult: 9,
};

function createMaskedText(text: string): string {
  const eligible = new Array(text.length).fill(true);

  let pos = 0;
  let inFencedBlock = false;

  while (pos < text.length) {
    const lineStart = pos;

    let lineEnd = text.indexOf("\n", pos);
    if (lineEnd === -1) lineEnd = text.length;

    const line = text.slice(lineStart, lineEnd);

    if (line.trimStart().startsWith("```")) {
      inFencedBlock = !inFencedBlock;
      for (let i = lineStart; i <= lineEnd; i++) {
        eligible[i] = false;
      }
    } else if (line.startsWith(">")) {
      for (let i = lineStart; i <= lineEnd; i++) {
        eligible[i] = false;
      }
    } else if (inFencedBlock) {
      const trimmed = line.trimStart();
      const isComment =
        trimmed.startsWith("#") ||
        trimmed.startsWith("//") ||
        trimmed.startsWith("/*");

      if (!isComment) {
        for (let i = lineStart; i <= lineEnd; i++) {
          eligible[i] = false;
        }
      }
    }

    pos = lineEnd + 1;
  }

  const protectedPatterns = [
    /https?:\/\/[^\s]+/g,
    /@[a-zA-Z0-9_-]+/g,
    /#[a-zA-Z0-9_-]+/g,
  ];

  for (const pattern of protectedPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const start = match.index;
      if (start !== undefined) {
        const end = start + match[0].length;
        for (let i = start; i < end; i++) {
          eligible[i] = false;
        }
      }
    }
  }

  let masked = "";
  for (let i = 0; i < text.length; i++) {
    masked += eligible[i] ? text[i] : " ";
  }

  return masked;
}

export function detectIssues(text: string): Detection[] {
  const candidates: Detection[] = [];
  const seen = new Set<string>();

  // Create masked text where ineligible zones are replaced with spaces
  const maskedText = createMaskedText(text);

  const obscenityMatches = obscenityMatcher.getAllMatches(maskedText, true);
  for (const match of obscenityMatches) {
    addCandidate(
      createObscenityDetection(text, match.startIndex, match.endIndex + 1),
    );
  }

  const words = maskedText.split(/\b/);
  let position = 0;

  for (const word of words) {
    const lowerWord = word.toLowerCase();
    const replacement = allWordReplacements[lowerWord];

    if (replacement) {
      // Extract original word from original text using indices
      const originalWord = text.slice(position, position + word.length);
      const wordType = getWordType(lowerWord);
      addCandidate({
        type: wordType,
        original: originalWord,
        replacement: matchCase(originalWord, replacement),
        startIndex: position,
        endIndex: position + word.length,
      });
    }

    position += word.length;
  }

  for (const group of phraseGroups) {
    for (const phrase of group.phrases) {
      const regex = new RegExp(phrase.pattern.source, phrase.pattern.flags);
      let match = regex.exec(maskedText);

      while (match !== null) {
        // Extract original phrase from original text using indices
        const originalPhrase = text.slice(
          match.index,
          match.index + match[0].length,
        );
        addCandidate({
          type: group.type,
          original: originalPhrase,
          replacement: matchPhraseCase(
            text,
            match.index,
            originalPhrase,
            phrase.replacement,
          ),
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });

        match = regex.exec(maskedText);
      }
    }
  }

  candidates.sort((a, b) => {
    const startDiff = a.startIndex - b.startIndex;
    if (startDiff !== 0) return startDiff;

    const endDiff = b.endIndex - a.endIndex;
    if (endDiff !== 0) return endDiff;

    const priorityDiff =
      detectionTypePriority[a.type] - detectionTypePriority[b.type];
    if (priorityDiff !== 0) return priorityDiff;

    const typeDiff = a.type.localeCompare(b.type);
    if (typeDiff !== 0) return typeDiff;

    return a.replacement.localeCompare(b.replacement);
  });

  const detections: Detection[] = [];
  for (const detection of candidates) {
    const previous = detections[detections.length - 1];
    if (
      previous &&
      rangesOverlap(
        previous.startIndex,
        previous.endIndex,
        detection.startIndex,
        detection.endIndex,
      )
    ) {
      continue;
    }

    detections.push(detection);
  }

  return detections;

  function addCandidate(detection: Detection): void {
    const key = `${detection.startIndex}:${detection.endIndex}:${detection.type}`;
    if (seen.has(key)) return;

    seen.add(key);
    candidates.push(detection);
  }
}

function createObscenityDetection(
  text: string,
  matchStartIndex: number,
  matchEndIndex: number,
): Detection {
  const originalMatch = text.slice(matchStartIndex, matchEndIndex);
  const lowerMatch = originalMatch.toLowerCase();

  const tokenBounds = getAsciiWordBounds(text, matchStartIndex, matchEndIndex);
  const tokenLower = text
    .slice(tokenBounds.startIndex, tokenBounds.endIndex)
    .toLowerCase();

  const matchStartInToken = matchStartIndex - tokenBounds.startIndex;
  const matchEndInToken = matchEndIndex - tokenBounds.startIndex;

  const bestKeyMatch = findBestKeyContainingMatch(
    tokenLower,
    matchStartInToken,
    matchEndInToken,
  );

  if (bestKeyMatch) {
    const detectionStart = tokenBounds.startIndex + bestKeyMatch.startInToken;
    const detectionEnd = detectionStart + bestKeyMatch.key.length;

    const original = text.slice(detectionStart, detectionEnd);
    const replacement = allWordReplacements[bestKeyMatch.key];

    if (replacement !== undefined) {
      return {
        type: getWordType(bestKeyMatch.key),
        original,
        replacement: matchCase(original, replacement),
        startIndex: detectionStart,
        endIndex: detectionEnd,
      };
    }
  }

  const replacement =
    allWordReplacements[lowerMatch] ||
    findClosestReplacement(lowerMatch) ||
    "[removed]";

  return {
    type: getWordType(lowerMatch),
    original: originalMatch,
    replacement: matchCase(originalMatch, replacement),
    startIndex: matchStartIndex,
    endIndex: matchEndIndex,
  };
}

function getWordType(word: string): Detection["type"] {
  if (Object.hasOwn(insultReplacements, word)) {
    return "insult";
  }
  return "profanity";
}

function findBestKeyContainingMatch(
  tokenLower: string,
  matchStartIndex: number,
  matchEndIndex: number,
): { key: string; startInToken: number } | null {
  for (const key of allWordKeys) {
    let keyStart = tokenLower.indexOf(key);

    while (keyStart !== -1) {
      const keyEnd = keyStart + key.length;
      const containsMatch =
        keyStart <= matchStartIndex && keyEnd >= matchEndIndex;

      if (containsMatch) {
        return { key, startInToken: keyStart };
      }

      keyStart = tokenLower.indexOf(key, keyStart + 1);
    }
  }

  return null;
}

function getAsciiWordBounds(
  text: string,
  matchStartIndex: number,
  matchEndIndex: number,
): { startIndex: number; endIndex: number } {
  let startIndex = matchStartIndex;
  while (startIndex > 0) {
    const char = text[startIndex - 1];
    if (char === undefined || !isAsciiLetter(char)) break;
    startIndex--;
  }

  let endIndex = matchEndIndex;
  while (endIndex < text.length) {
    const char = text[endIndex];
    if (char === undefined || !isAsciiLetter(char)) break;
    endIndex++;
  }

  return { startIndex, endIndex };
}

function isAsciiLetter(char: string): boolean {
  const code = char.charCodeAt(0);
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function findClosestReplacement(word: string): string | null {
  const cleaned = word.replace(/[^a-z]/g, "");

  if (cleaned.length === 0) {
    return null;
  }

  for (const [key, value] of Object.entries(allWordReplacements)) {
    if (cleaned.includes(key) || key.includes(cleaned)) {
      return value;
    }
  }

  return null;
}

function matchCase(original: string, replacement: string): string {
  if (original === original.toUpperCase()) {
    return replacement.toUpperCase();
  }

  const firstChar = original[0];
  if (firstChar && firstChar === firstChar.toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }

  return replacement;
}

function matchPhraseCase(
  text: string,
  matchIndex: number,
  original: string,
  replacement: string,
): string {
  if (original === original.toUpperCase()) {
    return replacement.toUpperCase();
  }

  if (isSentenceStart(text, matchIndex)) {
    return capitalizeFirstLetter(replacement);
  }

  return replacement;
}

function isSentenceStart(text: string, matchIndex: number): boolean {
  if (matchIndex <= 0) return true;

  let index = matchIndex - 1;

  while (index >= 0) {
    const char = text[index];
    if (char === undefined) break;
    if (!isWhitespace(char)) break;
    index--;
  }

  while (index >= 0) {
    const char = text[index];
    if (char === undefined) break;
    if (!isLeadingDelimiter(char)) break;
    index--;
  }

  if (index < 0) return true;

  const boundary = text[index];
  return (
    boundary === "." ||
    boundary === "!" ||
    boundary === "?" ||
    boundary === "\n" ||
    boundary === "\r"
  );
}

function isWhitespace(char: string): boolean {
  return char === " " || char === "\t" || char === "\n" || char === "\r";
}

function isLeadingDelimiter(char: string): boolean {
  return (
    char === '"' || char === "'" || char === "(" || char === "[" || char === "{"
  );
}

function capitalizeFirstLetter(value: string): string {
  const firstChar = value.charAt(0);
  if (!firstChar) return value;
  return firstChar.toUpperCase() + value.slice(1);
}

export function hasProfanity(text: string): boolean {
  return obscenityMatcher.hasMatch(text);
}
