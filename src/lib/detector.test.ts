import { describe, expect, test } from "bun:test";

import { detectIssues } from "./detector";

describe("detectIssues", () => {
  test("prefers whole-word replacements when obscenity match is a substring", () => {
    expect(detectIssues("asshole")).toEqual([
      {
        type: "profanity",
        original: "asshole",
        replacement: "friend",
        startIndex: 0,
        endIndex: 7,
      },
    ]);

    expect(detectIssues("bullshit")).toEqual([
      {
        type: "profanity",
        original: "bullshit",
        replacement: "nonsense",
        startIndex: 0,
        endIndex: 8,
      },
    ]);
  });

  test("does not flag common workplace terms like assess/assessment", () => {
    expect(detectIssues("assess")).toEqual([]);
    expect(detectIssues("assessment")).toEqual([]);
    expect(detectIssues("assessing")).toEqual([]);
    expect(detectIssues("assessments")).toEqual([]);
  });

  test("preserves case when replacing", () => {
    expect(detectIssues("BULLSHIT")[0]?.replacement).toBe("NONSENSE");
    expect(detectIssues("Bullshit")[0]?.replacement).toBe("Nonsense");
    expect(detectIssues("FUCK")[0]?.replacement).toBe("HECK");
  });

  test("prefers clause rewrites over phrase replacements", () => {
    expect(detectIssues("This is ridiculous")).toEqual([
      {
        type: "clause-rewrite-frustration",
        original: "This is ridiculous",
        replacement:
          "This situation is concerning. I'd like to explore solutions to address it.",
        startIndex: 0,
        endIndex: 18,
      },
    ]);
  });

  test("detects multiple issues in one pass", () => {
    const detections = detectIssues("fucking bullshit asshole");

    expect(detections.map((d) => d.original)).toEqual([
      "fucking",
      "bullshit",
      "asshole",
    ]);

    expect(detections.map((d) => d.replacement)).toEqual([
      "freaking",
      "nonsense",
      "friend",
    ]);
  });

  test("replaces hedging phrases with persuasion alternatives", () => {
    expect(detectIssues("I think we should ship")).toEqual([
      {
        type: "persuasion-hedging",
        original: "I think we should",
        replacement: "I recommend we",
        startIndex: 0,
        endIndex: 17,
      },
    ]);
  });

  test("does not incorrectly capitalize mid-sentence phrase replacements", () => {
    expect(detectIssues("and I believe this works")).toEqual([
      {
        type: "persuasion-hedging",
        original: "I believe",
        replacement: "the evidence suggests",
        startIndex: 4,
        endIndex: 13,
      },
    ]);
  });

  test("categorizes follow-up phrases under persuasion", () => {
    expect(detectIssues("Just checking in on the status")).toEqual([
      {
        type: "persuasion-followups",
        original: "Just checking in",
        replacement: "Following up",
        startIndex: 0,
        endIndex: 16,
      },
    ]);
  });
});

describe("excluded zone masking", () => {
  test("does not modify quoted email thread lines starting with >", () => {
    const input = "> This is fucking bullshit";
    expect(detectIssues(input)).toEqual([]);
  });

  test("does not modify profanity in multiple quoted lines", () => {
    const input = "> This is shit\n> And this is fucking stupid";
    expect(detectIssues(input)).toEqual([]);
  });

  test("detects profanity in normal text but not quoted lines", () => {
    const input = "This is shit\n> But this fucking line is quoted";
    const detections = detectIssues(input);

    expect(detections).toHaveLength(1);
    expect(detections[0]?.original).toBe("shit");
    expect(detections[0]?.startIndex).toBe(8);
  });

  test("does not modify fenced code blocks", () => {
    const input = "```\nfucking code here\nbullshit\n```";
    expect(detectIssues(input)).toEqual([]);
  });

  test("does not modify code blocks with language specifier", () => {
    const input = "```typescript\nconst shit = 'value';\n```";
    expect(detectIssues(input)).toEqual([]);
  });

  test("does not detect profanity in comments inside fenced code blocks", () => {
    const input = "```\n// This is fucking stupid\n```";
    const detections = detectIssues(input);

    expect(detections.length).toBe(0);
  });

  test("does not detect profanity in hash comments inside fenced code", () => {
    const input = "```python\n# This shit is broken\n```";
    const detections = detectIssues(input);

    expect(detections.length).toBe(0);
  });

  test("does not detect profanity in block comments inside fenced code", () => {
    const input = "```javascript\n/* This is fucking ridiculous */\n```";
    const detections = detectIssues(input);

    expect(detections.length).toBe(0);
  });

  test("handles mixed content with quotes, code, and normal text", () => {
    const input =
      "This is shit\n> Quoted fucking line\n```\ncode bullshit\n```\nMore damn text";
    const detections = detectIssues(input);

    expect(detections.map((d) => d.original)).toEqual(["shit", "damn"]);
  });

  test("handles nested fences correctly by toggling state", () => {
    const input =
      "```\nfirst block with shit\n```\nfucking text\n```\nsecond block\n```";
    const detections = detectIssues(input);

    expect(detections.length).toBeGreaterThan(0);
    expect(detections.some((d) => d.original === "fucking")).toBe(true);
    expect(detections.some((d) => d.original === "shit")).toBe(false);
  });

  test("preserves exact indices for detections in masked text", () => {
    const input = "Normal shit here\n> Quoted fucking text\nMore bullshit";
    const detections = detectIssues(input);

    expect(detections).toHaveLength(2);
    expect(detections[0]?.original).toBe("shit");
    expect(detections[0]?.startIndex).toBe(7);
    expect(detections[0]?.endIndex).toBe(11);

    expect(detections[1]?.original).toBe("bullshit");
    expect(
      input.slice(detections[1]?.startIndex, detections[1]?.endIndex),
    ).toBe("bullshit");
  });
});

describe("constrained fuzzy matching", () => {
  test("detects common typos with edit distance 1 - fuk", () => {
    const detections = detectIssues("This is fuk");

    expect(detections).toHaveLength(1);
    expect(detections[0]?.original).toBe("fuk");
    expect(detections[0]?.type).toBe("profanity");
    expect(detections[0]?.replacement).toBe("heck");
  });

  test("detects common typos with edit distance 1 - shlt", () => {
    const detections = detectIssues("This shlt is broken");

    expect(detections).toHaveLength(1);
    expect(detections[0]?.original).toBe("shlt");
    expect(detections[0]?.type).toBe("profanity");
    expect(detections[0]?.replacement).toBe("stuff");
  });

  test("detects common typos with edit distance 1 - dmn", () => {
    const detections = detectIssues("dmn it");

    expect(detections).toHaveLength(1);
    expect(detections[0]?.original).toBe("dmn");
    expect(detections[0]?.type).toBe("profanity");
    expect(detections[0]?.replacement).toBe("darn");
  });

  test("does NOT match safe words - assess", () => {
    const detections = detectIssues("We need to assess the situation");

    expect(detections).toEqual([]);
  });

  test("does NOT match safe words - asset", () => {
    const detections = detectIssues("This is a valuable asset");

    expect(detections).toEqual([]);
  });

  test("does NOT match safe words - shell", () => {
    const detections = detectIssues("Run the shell command");

    expect(detections).toEqual([]);
  });

  test("does NOT match safe words - craft", () => {
    const detections = detectIssues("Let's craft a solution");

    expect(detections).toEqual([]);
  });

  test("does NOT match words with edit distance > 1", () => {
    const detections = detectIssues("This is funk music");

    expect(detections).toEqual([]);
  });
});

describe("segmentSentences", () => {
  test("segments simple sentences", () => {
    const { segmentSentences } = require("./detector");
    const input = "First sentence. Second sentence.";
    const spans = segmentSentences(input);

    expect(spans).toHaveLength(2);
    expect(input.slice(spans[0]?.startIndex, spans[0]?.endIndex)).toBe(
      "First sentence.",
    );
    expect(input.slice(spans[1]?.startIndex, spans[1]?.endIndex)).toBe(
      "Second sentence.",
    );
  });

  test("handles text without sentence boundaries", () => {
    const { segmentSentences } = require("./detector");
    const input = "Just one sentence without period";
    const spans = segmentSentences(input);

    expect(spans).toHaveLength(1);
    expect(input.slice(spans[0]?.startIndex, spans[0]?.endIndex)).toBe(input);
  });

  test("does not split on punctuation inside URLs", () => {
    const { segmentSentences } = require("./detector");
    const input = "Visit https://example.com for more information.";
    const spans = segmentSentences(input);

    expect(spans).toHaveLength(1);
    expect(input.slice(spans[0]?.startIndex, spans[0]?.endIndex)).toBe(input);
  });

  test("protects @handles and #channels from being split", () => {
    const { segmentSentences } = require("./detector");
    const input = "Contact @user_name in #team-channel for updates.";
    const spans = segmentSentences(input);

    expect(spans).toHaveLength(1);
    expect(input.slice(spans[0]?.startIndex, spans[0]?.endIndex)).toBe(input);
  });

  test("does not produce spans crossing quoted email thread lines", () => {
    const { segmentSentences } = require("./detector");
    const input = "This is my text.\n> This is quoted.\nMore of my text.";
    const spans = segmentSentences(input);

    expect(spans).toHaveLength(2);
    expect(input.slice(spans[0]?.startIndex, spans[0]?.endIndex)).toBe(
      "This is my text.\n",
    );
    expect(input.slice(spans[1]?.startIndex, spans[1]?.endIndex)).toBe(
      "More of my text.",
    );
  });

  test("does not produce spans crossing fenced code blocks", () => {
    const { segmentSentences } = require("./detector");
    const input = "Text before.\n```\ncode with periods.\n```\nText after.";
    const spans = segmentSentences(input);

    expect(spans).toHaveLength(2);
    expect(input.slice(spans[0]?.startIndex, spans[0]?.endIndex)).toBe(
      "Text before.\n",
    );
    expect(input.slice(spans[1]?.startIndex, spans[1]?.endIndex)).toBe(
      "Text after.",
    );
  });

  test("handles mixed content with quotes, code, URLs, and normal text", () => {
    const { segmentSentences } = require("./detector");
    const input =
      "Check https://example.com.\n> Quoted line.\n```\ncode block\n```\nFinal sentence!";
    const spans = segmentSentences(input);

    expect(spans).toHaveLength(2);
    expect(input.slice(spans[0]?.startIndex, spans[0]?.endIndex)).toBe(
      "Check https://example.com.\n",
    );
    expect(input.slice(spans[1]?.startIndex, spans[1]?.endIndex)).toBe(
      "Final sentence!",
    );
  });

  test("handles multiple sentence boundary types", () => {
    const { segmentSentences } = require("./detector");
    const input = "Question? Exclamation! Statement.";
    const spans = segmentSentences(input);

    expect(spans).toHaveLength(3);
    expect(input.slice(spans[0]?.startIndex, spans[0]?.endIndex)).toBe(
      "Question?",
    );
    expect(input.slice(spans[1]?.startIndex, spans[1]?.endIndex)).toBe(
      "Exclamation!",
    );
    expect(input.slice(spans[2]?.startIndex, spans[2]?.endIndex)).toBe(
      "Statement.",
    );
  });

  test("handles newlines as sentence boundaries", () => {
    const { segmentSentences } = require("./detector");
    const input = "First line\nSecond line\nThird line";
    const spans = segmentSentences(input);

    expect(spans).toHaveLength(3);
    expect(input.slice(spans[0]?.startIndex, spans[0]?.endIndex)).toBe(
      "First line\n",
    );
    expect(input.slice(spans[1]?.startIndex, spans[1]?.endIndex)).toBe(
      "Second line\n",
    );
    expect(input.slice(spans[2]?.startIndex, spans[2]?.endIndex)).toBe(
      "Third line",
    );
  });
});
