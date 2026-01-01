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

const obscenityMatcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

const allWordReplacements: Record<string, string> = {
  ...profanityReplacements,
  ...insultReplacements,
};

const allPhraseReplacements: PhraseReplacement[] = [
  ...aggressivePhrases,
  ...passiveAggressivePhrases,
];

export function detectIssues(text: string): Detection[] {
  const detections: Detection[] = [];

  const obscenityMatches = obscenityMatcher.getAllMatches(text);
  for (const match of obscenityMatches) {
    const originalWord = text.slice(match.startIndex, match.endIndex + 1);
    const lowerWord = originalWord.toLowerCase();

    const replacement =
      allWordReplacements[lowerWord] ||
      findClosestReplacement(lowerWord) ||
      "[removed]";

    detections.push({
      type: "profanity",
      original: originalWord,
      replacement: matchCase(originalWord, replacement),
      startIndex: match.startIndex,
      endIndex: match.endIndex + 1,
    });
  }

  const words = text.split(/\b/);
  let position = 0;

  for (const word of words) {
    const lowerWord = word.toLowerCase();

    if (
      insultReplacements[lowerWord] &&
      !isAlreadyDetected(detections, position, position + word.length)
    ) {
      detections.push({
        type: "insult",
        original: word,
        replacement: matchCase(word, insultReplacements[lowerWord]),
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
      if (
        !isAlreadyDetected(
          detections,
          match.index,
          match.index + match[0].length,
        )
      ) {
        const type = aggressivePhrases.includes(phrase)
          ? "aggressive"
          : "passive-aggressive";

        detections.push({
          type,
          original: match[0],
          replacement: matchCase(match[0], phrase.replacement),
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
      match = regex.exec(text);
    }
  }

  detections.sort((a, b) => a.startIndex - b.startIndex);
  return detections;
}

function isAlreadyDetected(
  detections: Detection[],
  start: number,
  end: number,
): boolean {
  return detections.some(
    (d) =>
      (start >= d.startIndex && start < d.endIndex) ||
      (end > d.startIndex && end <= d.endIndex),
  );
}

function findClosestReplacement(word: string): string | null {
  const cleaned = word.replace(/[^a-z]/g, "");

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
