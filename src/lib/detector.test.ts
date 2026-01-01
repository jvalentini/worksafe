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
});
