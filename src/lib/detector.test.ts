import { describe, expect, test } from "bun:test";

import { detectIssues } from "./detector";

describe("detectIssues", () => {
  test("prefers whole-word replacements when obscenity match is a substring", () => {
    expect(detectIssues("asshole")).toEqual([
      {
        type: "profanity",
        original: "asshole",
        replacement: "jerk",
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

  test("prefers phrase replacements over overlapping word replacements", () => {
    expect(detectIssues("This is ridiculous")).toEqual([
      {
        type: "aggressive",
        original: "This is ridiculous",
        replacement: "This is unexpected",
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
      "jerk",
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
