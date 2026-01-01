import { describe, expect, test } from "bun:test";

import { formatAsEmail, getChangeSummary, transformText } from "./replacer";

describe("transformText", () => {
  test("returns original text when no changes needed", () => {
    const result = transformText("Hello team");

    expect(result.original).toBe("Hello team");
    expect(result.transformed).toBe("Hello team");
    expect(result.changeCount).toBe(0);
    expect(result.changes).toEqual([]);
  });

  test("transforms profanity and returns change metadata", () => {
    const result = transformText("fucking bullshit asshole");

    expect(result.transformed).toBe("freaking nonsense jerk");
    expect(result.changeCount).toBe(3);
    expect(result.changes.map((c) => c.original)).toEqual([
      "fucking",
      "bullshit",
      "asshole",
    ]);
  });
});

describe("formatAsEmail", () => {
  test("adds greeting and closing when missing", () => {
    expect(formatAsEmail("Please review the PR.")).toBe(
      "Hi,\n\nPlease review the PR.\n\nBest regards",
    );
  });

  test("does not add greeting if one is present", () => {
    expect(formatAsEmail("Hi team\n\nPlease review the PR.")).toBe(
      "Hi team\n\nPlease review the PR.\n\nBest regards",
    );
  });

  test("does not add closing if one is present", () => {
    expect(formatAsEmail("Please review the PR.\n\nThanks")).toBe(
      "Hi,\n\nPlease review the PR.\n\nThanks",
    );
  });
});

describe("getChangeSummary", () => {
  test("summarizes counts by type", () => {
    const result = transformText("This is ridiculous");
    expect(getChangeSummary(result.changes)).toBe(
      "Transformed 1 aggressive phrase",
    );
  });
});
