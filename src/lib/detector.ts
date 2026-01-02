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
import { sarcasmPhrases } from "./dictionaries/sarcasm";

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
    | "persuasion-followups"
    | "clause-rewrite-attack"
    | "clause-rewrite-frustration"
    | "sarcasm";
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

const ENABLE_FUZZY_MATCHING = true;
const MAX_FUZZY_EDIT_DISTANCE = 1;
const MIN_FUZZY_MATCH_LENGTH = 3;
const MAX_FUZZY_LENGTH_DIFF = 1;

const HIGH_IMPACT_FUZZY_MATCH_TERMS = new Set([
  "fuck",
  "fucking",
  "shit",
  "bullshit",
  "asshole",
  "damn",
  "hell",
  "bitch",
  "bastard",
  "crap",
]);

const SAFE_WORDS_BLACKLIST = new Set([
  "is",
  "it",
  "on",
  "the",
  "a",
  "an",
  "we",
  "he",
  "she",
  "they",
  "s",
  "t",
  "ship",
  "ships",
  "assess",
  "assessed",
  "assesses",
  "assessing",
  "assessment",
  "assessments",
  "assessor",
  "assessors",
  "asset",
  "assets",
  "shell",
  "shells",
  "craft",
  "crafts",
  "bass",
  "class",
  "glass",
  "mass",
  "pass",
  "grass",
  "funk",
  "funky",
]);

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

function buildPhraseGroups(sarcasmMode: boolean): Array<{
  type: Detection["type"];
  phrases: PhraseReplacement[];
}> {
  const groups: Array<{
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

  if (sarcasmMode) {
    groups.push({ type: "sarcasm", phrases: sarcasmPhrases });
  }

  return groups;
}

const detectionTypePriority: Record<Detection["type"], number> = {
  "clause-rewrite-attack": 0,
  "clause-rewrite-frustration": 1,
  aggressive: 2,
  "passive-aggressive": 3,
  sarcasm: 4,
  "persuasion-hedging": 5,
  "persuasion-apologies": 6,
  "persuasion-qualifiers": 7,
  "persuasion-commitments": 8,
  "persuasion-validation": 9,
  "persuasion-followups": 10,
  profanity: 11,
  insult: 12,
};

function createMaskedText(text: string): string {
  const eligible = Array.from({ length: text.length }, () => true);

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
      for (let i = lineStart; i <= lineEnd; i++) {
        eligible[i] = false;
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

export interface DetectionOptions {
  sarcasmMode?: boolean;
}

export function detectIssues(
  text: string,
  options: DetectionOptions = {},
): Detection[] {
  const { sarcasmMode = false } = options;
  const candidates: Detection[] = [];
  const seen = new Set<string>();

  const maskedText = createMaskedText(text);

  const { rewrites: clauseRewrites, skippedRanges } = detectClauseRewrites(
    text,
    maskedText,
  );
  for (const rewrite of clauseRewrites) {
    addCandidate(rewrite);
  }

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
    let replacement = allWordReplacements[lowerWord];

    if (!replacement && ENABLE_FUZZY_MATCHING && /^[a-z]+$/i.test(word)) {
      const fuzzyMatch = findClosestReplacement(lowerWord);
      if (fuzzyMatch) {
        replacement = fuzzyMatch;
      }
    }

    if (replacement) {
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

  const phraseGroups = buildPhraseGroups(sarcasmMode);

  for (const group of phraseGroups) {
    for (const phrase of group.phrases) {
      const regex = new RegExp(phrase.pattern.source, phrase.pattern.flags);
      let match = regex.exec(maskedText);

      while (match !== null) {
        const originalPhrase = text.slice(
          match.index,
          match.index + match[0].length,
        );
        const hasProtectedTokens =
          /https?:\/\/[^\s]+|@[a-zA-Z0-9_-]+|#[a-zA-Z0-9_-]+/.test(
            originalPhrase,
          );

        if (!hasProtectedTokens) {
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
        }

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

    const isInSkippedRange = skippedRanges.some((range) =>
      rangesOverlap(
        range.startIndex,
        range.endIndex,
        detection.startIndex,
        detection.endIndex,
      ),
    );

    if (isInSkippedRange) {
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

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    if (matrix[0]) {
      matrix[0][j] = j;
    }
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
      const row = matrix[i];
      const prevRow = matrix[i - 1];

      if (row && prevRow) {
        const deletion = (prevRow[j] ?? 0) + 1;
        const insertion = (row[j - 1] ?? 0) + 1;
        const substitution = (prevRow[j - 1] ?? 0) + cost;

        row[j] = Math.min(deletion, insertion, substitution);
      }
    }
  }

  const lastRow = matrix[b.length];
  return lastRow?.[a.length] ?? Number.MAX_SAFE_INTEGER;
}

function isSubstringOfSafeWord(word: string, targetTerm: string): boolean {
  const safeWords = extraWhitelistedTerms;

  for (const safeWord of safeWords) {
    const lowerSafeWord = safeWord.toLowerCase();
    if (
      lowerSafeWord.includes(word.toLowerCase()) &&
      lowerSafeWord !== word.toLowerCase()
    ) {
      return true;
    }
  }

  return false;
}

function findClosestReplacement(word: string): string | null {
  const cleaned = word.replace(/[^a-z]/g, "");

  if (cleaned.length === 0) {
    return null;
  }

  const cleanedLower = cleaned.toLowerCase();

  if (SAFE_WORDS_BLACKLIST.has(cleanedLower)) {
    return null;
  }

  if (
    extraWhitelistedTerms.some((term) => term.toLowerCase() === cleanedLower)
  ) {
    return null;
  }

  for (const [key, value] of Object.entries(allWordReplacements)) {
    if (cleaned.includes(key) || key.includes(cleaned)) {
      return value;
    }
  }

  if (!ENABLE_FUZZY_MATCHING) {
    return null;
  }

  if (cleaned.length < MIN_FUZZY_MATCH_LENGTH) {
    return null;
  }

  let bestMatch: { key: string; distance: number } | null = null;

  for (const term of HIGH_IMPACT_FUZZY_MATCH_TERMS) {
    const lengthDiff = Math.abs(cleaned.length - term.length);
    if (lengthDiff > MAX_FUZZY_LENGTH_DIFF) {
      continue;
    }

    const distance = levenshteinDistance(cleaned, term);

    if (distance <= MAX_FUZZY_EDIT_DISTANCE && distance > 0) {
      if (bestMatch === null || distance < bestMatch.distance) {
        if (!isSubstringOfSafeWord(cleaned, term)) {
          bestMatch = { key: term, distance };
        }
      }
    }
  }

  if (bestMatch) {
    return allWordReplacements[bestMatch.key] ?? null;
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

/**
 * Tokenize text into tokens with position tracking.
 * Protected tokens (URLs, @handles, #channels) are marked and act as barriers.
 */
export function tokenize(text: string, maskedText: string): Token[] {
  const tokens: Token[] = [];
  const protectedPattern = /https?:\/\/[^\s]+|@[a-zA-Z0-9_-]+|#[a-zA-Z0-9_-]+/g;
  const protectedRanges: Array<{ start: number; end: number }> = [];

  // Find all protected token ranges
  let match = protectedPattern.exec(text);
  while (match !== null) {
    protectedRanges.push({
      start: match.index,
      end: match.index + match[0].length,
    });
    match = protectedPattern.exec(text);
  }

  // Check if position is in a protected range
  const isInProtectedRange = (pos: number): boolean => {
    return protectedRanges.some(
      (range) => pos >= range.start && pos < range.end,
    );
  };

  // Split on word boundaries while tracking positions
  const wordPattern = /\b[\w'-]+\b/g;
  let wordMatch = wordPattern.exec(text);

  while (wordMatch !== null) {
    const raw = wordMatch[0];
    const startIndex = wordMatch.index;
    const endIndex = startIndex + raw.length;

    // Check if this token is in an excluded zone
    const maskedSubstring = maskedText.slice(startIndex, endIndex);
    const isInExcludedZone = maskedSubstring !== raw;

    // Only include tokens that are in eligible zones
    if (!isInExcludedZone) {
      const isProtected = isInProtectedRange(startIndex);
      tokens.push({
        raw,
        normalized: raw.toLowerCase(),
        startIndex,
        endIndex,
        isProtected,
      });
    }

    wordMatch = wordPattern.exec(text);
  }

  return tokens;
}

/**
 * Compute adjacency score for a pair of token lists within a sliding window.
 * Returns the highest score found, or null if no matches within window.
 *
 * Score formula: 1 / (1 + distance)
 * - Distance 0 (adjacent): score = 1.0
 * - Distance 1 (1 token apart): score = 0.5
 * - Distance 2 (2 tokens apart): score = 0.33
 * - etc.
 *
 * Protected tokens act as barriers: we cannot match across them.
 */
export function computeAdjacencyScore(
  tokens: Token[],
  rule: AdjacencyRule,
): AdjacencyScore | null {
  const windowSize = rule.maxDistance;
  let bestScore: AdjacencyScore | null = null;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;

    // Check if this is a trigger token
    if (!rule.triggerTokens.includes(token.normalized)) {
      continue;
    }

    // Look ahead within window for target tokens
    for (let j = i + 1; j < tokens.length; j++) {
      const targetToken = tokens[j];
      if (!targetToken) break;

      const distance = j - i - 1;

      if (distance > windowSize) {
        break;
      }

      // Protected tokens are barriers - stop scanning
      if (targetToken.isProtected) {
        break;
      }

      // Check if this is a target token
      if (rule.targetTokens.includes(targetToken.normalized)) {
        const score = 1 / (1 + distance);

        if (bestScore === null || score > bestScore.score) {
          bestScore = {
            score,
            matchedTrigger: token.normalized,
            matchedTarget: targetToken.normalized,
            triggerIndex: i,
            targetIndex: j,
          };
        }
      }
    }
  }

  return bestScore;
}

export interface SentenceSpan {
  startIndex: number;
  endIndex: number;
}

export interface Token {
  raw: string;
  normalized: string;
  startIndex: number;
  endIndex: number;
  isProtected: boolean;
}

export interface AdjacencyRule {
  triggerTokens: string[];
  targetTokens: string[];
  maxDistance: number;
}

export interface AdjacencyScore {
  score: number;
  matchedTrigger: string;
  matchedTarget: string;
  triggerIndex: number;
  targetIndex: number;
}

export interface MultiTokenMatch {
  score: number;
  matchedTokens: string[];
  startIndex: number;
  endIndex: number;
}

export function findMultiTokenSequence(
  tokens: Token[],
  sequence: string[],
  maxGaps: number,
): MultiTokenMatch | null {
  if (sequence.length === 0) return null;

  for (let i = 0; i < tokens.length; i++) {
    const firstToken = tokens[i];
    if (!firstToken) continue;

    if (firstToken.normalized !== sequence[0]) continue;

    let seqIdx = 1;
    let tokenIdx = i + 1;
    let gapsUsed = 0;

    while (seqIdx < sequence.length && tokenIdx < tokens.length) {
      const token = tokens[tokenIdx];
      if (!token) break;

      if (token.isProtected) break;

      if (token.normalized === sequence[seqIdx]) {
        seqIdx++;
        tokenIdx++;
      } else {
        gapsUsed++;
        if (gapsUsed > maxGaps) break;
        tokenIdx++;
      }
    }

    if (seqIdx === sequence.length) {
      const endToken = tokens[tokenIdx - 1];
      if (!endToken) continue;

      const totalDistance = tokenIdx - i - 1;
      const score = 1 / (1 + totalDistance - sequence.length + 1);

      return {
        score,
        matchedTokens: sequence,
        startIndex: i,
        endIndex: tokenIdx - 1,
      };
    }
  }

  return null;
}

export function segmentSentences(text: string): SentenceSpan[] {
  const maskedText = createMaskedText(text);
  const spans: SentenceSpan[] = [];
  let sentenceStart = -1;

  for (let i = 0; i < text.length; i++) {
    const originalChar = text[i];
    const maskedChar = maskedText[i];

    if (originalChar === undefined || maskedChar === undefined) continue;

    const isInEligibleZone = maskedChar === originalChar;
    const isNonWhitespace = originalChar.trim() !== "";
    const shouldStartSentence =
      sentenceStart === -1 && isNonWhitespace && isInEligibleZone;

    if (shouldStartSentence) {
      sentenceStart = i;
    }

    const isPunctuationBoundary =
      maskedChar === "." || maskedChar === "!" || maskedChar === "?";
    const isNewlineBoundary = maskedChar === "\n";
    const isSentenceBoundary = isPunctuationBoundary || isNewlineBoundary;

    const shouldEndSentence = isSentenceBoundary && sentenceStart !== -1;

    if (shouldEndSentence) {
      let endIndex = i + 1;

      if (isPunctuationBoundary && endIndex < text.length) {
        const nextChar = maskedText[endIndex];
        if (nextChar === "\n") {
          endIndex++;
        }
      }

      spans.push({
        startIndex: sentenceStart,
        endIndex,
      });
      sentenceStart = -1;
      if (endIndex > i + 1) {
        i = endIndex - 1;
      }
    }
  }

  if (sentenceStart !== -1) {
    spans.push({
      startIndex: sentenceStart,
      endIndex: text.length,
    });
  }

  return spans;
}

interface SentenceCandidate {
  sentence: SentenceSpan;
  type: "clause-rewrite-attack" | "clause-rewrite-frustration";
  sentenceText: string;
  hasProtectedTokens: boolean;
  isInExcludedZone: boolean;
}

interface ClauseRewriteResult {
  rewrites: Detection[];
  skippedRanges: Array<{ startIndex: number; endIndex: number }>;
}

function detectClauseRewrites(
  text: string,
  maskedText: string,
): ClauseRewriteResult {
  const sentences = segmentSentences(text);
  const tokens = tokenize(text, maskedText);

  const insultTerms = Object.keys(insultReplacements);
  const negativeTerms = [
    "ridiculous",
    "absurd",
    "unacceptable",
    "terrible",
    "awful",
    "horrible",
    "garbage",
    "trash",
    "useless",
    "worthless",
    "pathetic",
  ];

  const ADJACENCY_THRESHOLD = 0.2;
  const DEFAULT_WINDOW_SIZE = 6;

  const attackRule: AdjacencyRule = {
    triggerTokens: ["you", "your"],
    targetTokens: insultTerms,
    maxDistance: DEFAULT_WINDOW_SIZE,
  };

  const frustrationRule: AdjacencyRule = {
    triggerTokens: ["this", "that", "it"],
    targetTokens: negativeTerms,
    maxDistance: DEFAULT_WINDOW_SIZE,
  };

  const paJustCheckingRule: AdjacencyRule = {
    triggerTokens: ["just"],
    targetTokens: ["checking"],
    maxDistance: 3,
  };

  const paPerEmailRule: AdjacencyRule = {
    triggerTokens: ["per"],
    targetTokens: ["my"],
    maxDistance: 3,
  };

  const paFriendlyReminderRule: AdjacencyRule = {
    triggerTokens: ["friendly"],
    targetTokens: ["reminder"],
    maxDistance: 2,
  };

  const candidates: SentenceCandidate[] = [];
  const skippedRanges: Array<{ startIndex: number; endIndex: number }> = [];
  const passiveAggressiveDetections: Detection[] = [];

  const paSequences = [
    {
      tokens: ["just", "checking", "in"],
      replacement: "following up",
      exactPattern: /\bjust checking in\b/i,
    },
    {
      tokens: ["per", "my", "last", "email"],
      replacement: "as I mentioned",
      exactPattern: /\bper my last email\b/i,
    },
    {
      tokens: ["friendly", "reminder"],
      replacement: "reminder",
      exactPattern: /\bfriendly reminder\b/i,
    },
  ];

  for (const paSeq of paSequences) {
    const match = findMultiTokenSequence(tokens, paSeq.tokens, 3);
    if (match && match.score >= ADJACENCY_THRESHOLD) {
      const startToken = tokens[match.startIndex];
      const endToken = tokens[match.endIndex];

      if (!startToken || !endToken) continue;

      const hasProtectedTokensInRange = tokens
        .slice(match.startIndex, match.endIndex + 1)
        .some((t) => t.isProtected);

      if (hasProtectedTokensInRange) continue;

      const detectionStart = startToken.startIndex;
      const detectionEnd = endToken.endIndex;

      const original = text.slice(detectionStart, detectionEnd);
      const maskedOriginal = maskedText.slice(detectionStart, detectionEnd);

      if (original !== maskedOriginal) continue;

      if (paSeq.exactPattern.test(original)) continue;

      passiveAggressiveDetections.push({
        type: "passive-aggressive",
        original,
        replacement: matchPhraseCase(
          text,
          detectionStart,
          original,
          paSeq.replacement,
        ),
        startIndex: detectionStart,
        endIndex: detectionEnd,
      });
    }
  }

  for (const sentence of sentences) {
    const sentenceText = text.slice(sentence.startIndex, sentence.endIndex);
    const maskedSentenceText = maskedText.slice(
      sentence.startIndex,
      sentence.endIndex,
    );
    const lowerSentence = maskedSentenceText.toLowerCase();

    const isInExcludedZone = sentenceText !== maskedSentenceText;
    const hasProtectedTokens =
      /https?:\/\/|@[a-zA-Z0-9_-]+|#[a-zA-Z0-9_-]+/.test(sentenceText);

    const sentenceTokens = tokens.filter(
      (t) =>
        t.startIndex >= sentence.startIndex && t.endIndex <= sentence.endIndex,
    );

    const attackScore = computeAdjacencyScore(sentenceTokens, attackRule);
    const frustrationScore = computeAdjacencyScore(
      sentenceTokens,
      frustrationRule,
    );

    const isAttackPattern =
      attackScore !== null && attackScore.score >= ADJACENCY_THRESHOLD;
    const isFrustrationPattern =
      frustrationScore !== null &&
      frustrationScore.score >= ADJACENCY_THRESHOLD;

    if ((isAttackPattern || isFrustrationPattern) && hasProtectedTokens) {
      skippedRanges.push({
        startIndex: sentence.startIndex,
        endIndex: sentence.endIndex,
      });
      continue;
    }

    if (isInExcludedZone) {
      continue;
    }

    if (isAttackPattern) {
      candidates.push({
        sentence,
        type: "clause-rewrite-attack",
        sentenceText,
        hasProtectedTokens,
        isInExcludedZone,
      });
      continue;
    }

    if (isFrustrationPattern) {
      candidates.push({
        sentence,
        type: "clause-rewrite-frustration",
        sentenceText,
        hasProtectedTokens,
        isInExcludedZone,
      });
    }
  }

  if (candidates.length === 0) {
    return { rewrites: passiveAggressiveDetections, skippedRanges };
  }

  const groups: SentenceCandidate[][] = [];
  const firstCandidate = candidates[0];
  if (!firstCandidate) {
    return { rewrites: passiveAggressiveDetections, skippedRanges };
  }

  let currentGroup: SentenceCandidate[] = [firstCandidate];

  for (let i = 1; i < candidates.length; i++) {
    const prev = candidates[i - 1];
    const curr = candidates[i];

    if (!prev || !curr) continue;

    // Check if they are consecutive (only whitespace between them)
    const gapText = text.slice(
      prev.sentence.endIndex,
      curr.sentence.startIndex,
    );
    const gapMasked = maskedText.slice(
      prev.sentence.endIndex,
      curr.sentence.startIndex,
    );

    // Sentences are consecutive if the gap contains only whitespace AND
    // the gap is identical in both original and masked text (no excluded zones/protected tokens)
    const isConsecutive = gapText.trim() === "" && gapText === gapMasked;

    if (isConsecutive) {
      currentGroup.push(curr);
    } else {
      groups.push(currentGroup);
      currentGroup = [curr];
    }
  }
  groups.push(currentGroup);

  const rewrites: Detection[] = [];
  for (const group of groups) {
    const firstInGroup = group[0];
    const lastInGroup = group[group.length - 1];
    if (!firstInGroup || !lastInGroup) continue;

    const startIndex = firstInGroup.sentence.startIndex;
    const endIndex = lastInGroup.sentence.endIndex;
    const original = text.slice(startIndex, endIndex);

    const hasAttack = group.some((c) => c.type === "clause-rewrite-attack");
    const type = hasAttack
      ? "clause-rewrite-attack"
      : "clause-rewrite-frustration";

    let replacement: string;
    if (type === "clause-rewrite-attack") {
      replacement =
        "I'm concerned about this situation and would like to work through it together.";
    } else {
      replacement =
        "This situation is concerning. I'd like to explore solutions to address it.";
    }

    rewrites.push({
      type,
      original,
      replacement,
      startIndex,
      endIndex,
    });
  }

  return {
    rewrites: [...passiveAggressiveDetections, ...rewrites],
    skippedRanges,
  };
}
