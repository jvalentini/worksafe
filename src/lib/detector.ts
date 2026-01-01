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
import { profanityReplacements } from "./dictionaries/profanity";

export interface Detection {
  type: "profanity" | "insult" | "aggressive" | "passive-aggressive";
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

const allWordKeys = Object.keys(allWordReplacements).sort(
  (a, b) => b.length - a.length,
);

const allPhraseReplacements: PhraseReplacement[] = [
  ...aggressivePhrases,
  ...passiveAggressivePhrases,
];

export function detectIssues(text: string): Detection[] {
  const candidates: Detection[] = [];
  const seen = new Set<string>();

  const obscenityMatches = obscenityMatcher.getAllMatches(text, true);
  for (const match of obscenityMatches) {
    addCandidate(
      createObscenityDetection(text, match.startIndex, match.endIndex + 1),
    );
  }

  const words = text.split(/\b/);
  let position = 0;

  for (const word of words) {
    const lowerWord = word.toLowerCase();
    const replacement = insultReplacements[lowerWord];

    if (replacement) {
      addCandidate({
        type: "insult",
        original: word,
        replacement: matchCase(word, replacement),
        startIndex: position,
        endIndex: position + word.length,
      });
    }

    position += word.length;
  }

  for (const phrase of allPhraseReplacements) {
    const regex = new RegExp(phrase.pattern.source, phrase.pattern.flags);
    let match = regex.exec(text);

    while (match !== null) {
      const type = aggressivePhrases.includes(phrase)
        ? "aggressive"
        : "passive-aggressive";

      addCandidate({
        type,
        original: match[0],
        replacement: matchCase(match[0], phrase.replacement),
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });

      match = regex.exec(text);
    }
  }

  candidates.sort(
    (a, b) => a.startIndex - b.startIndex || b.endIndex - a.endIndex,
  );

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

export function hasProfanity(text: string): boolean {
  return obscenityMatcher.hasMatch(text);
}
