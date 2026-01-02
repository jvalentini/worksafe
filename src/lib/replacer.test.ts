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

  test("includes persuasion subcategory breakdown", () => {
    const result = transformText(
      "Just checking in. I think we should proceed.",
    );

    expect(getChangeSummary(result.changes)).toBe(
      "Transformed persuasion (1 hedging, 1 follow-up)",
    );
  });
});

describe("integration: full text transformation", () => {
  test("handles README example input", () => {
    const input =
      "This is bullshit. Why can't you idiots figure this out? I'm sick of explaining the same shit.";
    const result = transformText(input);

    expect(result.transformed).not.toContain("bullshit");
    expect(result.transformed).not.toContain("idiots");
    expect(result.transformed).not.toContain("shit");
    expect(result.transformed).toContain("nonsense");
    expect(result.transformed).toContain("people");
    expect(result.changeCount).toBeGreaterThanOrEqual(3);
  });

  test("handles mixed case profanity", () => {
    const result = transformText("BULLSHIT and SHIT and shit");

    expect(result.transformed).toBe("NONSENSE and STUFF and stuff");
    expect(result.changeCount).toBe(3);
  });

  test("handles insults in sentences", () => {
    const result = transformText("These idiots keep making stupid decisions");

    expect(result.transformed).toContain("people");
    expect(result.transformed).toContain("misguided");
    expect(result.changeCount).toBe(2);
  });

  test("handles passive-aggressive phrases", () => {
    const result = transformText(
      "Per my last email, as I already mentioned, this is a friendly reminder",
    );

    expect(result.transformed).not.toContain("Per my last email");
    expect(result.transformed).not.toContain("as I already mentioned");
    expect(result.transformed).not.toContain("friendly reminder");
    expect(result.changeCount).toBe(3);
  });

  test("handles aggressive phrases", () => {
    const result = transformText(
      "You always mess up. Why can't you understand? This is ridiculous.",
    );

    expect(result.transformed).not.toContain("You always");
    expect(result.transformed).not.toContain("Why can't you");
    expect(result.transformed).not.toContain("ridiculous");
    expect(result.changeCount).toBe(3);
  });

  test("preserves clean text around profanity", () => {
    const result = transformText("The meeting was productive but this is shit");

    expect(result.transformed).toStartWith("The meeting was productive but");
    expect(result.transformed).toEndWith("stuff");
  });

  test("handles adjacent profanity", () => {
    const result = transformText("shit shit shit");

    expect(result.transformed).toBe("stuff stuff stuff");
    expect(result.changeCount).toBe(3);
  });

  test("handles profanity with punctuation", () => {
    const result = transformText("This is shit! What the fuck?");

    expect(result.transformed).toBe("This is stuff! What the heck?");
    expect(result.changeCount).toBe(2);
  });

  test("handles empty input", () => {
    const result = transformText("");

    expect(result.transformed).toBe("");
    expect(result.changeCount).toBe(0);
  });

  test("handles whitespace-only input", () => {
    const result = transformText("   \n\t   ");

    expect(result.transformed).toBe("   \n\t   ");
    expect(result.changeCount).toBe(0);
  });
});
