import { describe, expect, test } from "bun:test";

import { formatAsEmail, getChangeSummary, transformText } from "./replacer";

interface TestCase {
  name: string;
  input: string;
  expectedContains?: string[];
  expectedNotContains?: string[];
  expectedExact?: string;
  expectedMinChangeCount?: number;
}

function runCase(tc: TestCase): void {
  const result = transformText(tc.input);

  if (tc.expectedExact !== undefined) {
    expect(result.transformed).toBe(tc.expectedExact);
  }

  if (tc.expectedContains) {
    for (const substr of tc.expectedContains) {
      expect(result.transformed).toContain(substr);
    }
  }

  if (tc.expectedNotContains) {
    for (const substr of tc.expectedNotContains) {
      expect(result.transformed).not.toContain(substr);
    }
  }

  if (tc.expectedMinChangeCount !== undefined) {
    expect(result.changeCount).toBeGreaterThanOrEqual(
      tc.expectedMinChangeCount,
    );
  }
}

describe("table-driven baseline transformations", () => {
  const baselineCases: TestCase[] = [
    {
      name: "single profanity replacement",
      input: "This is shit work",
      expectedContains: ["stuff"],
      expectedNotContains: ["shit"],
      expectedMinChangeCount: 1,
    },
    {
      name: "multiple profanity replacements",
      input: "fucking bullshit asshole",
      expectedExact: "freaking nonsense jerk",
    },
    {
      name: "insult word replacement",
      input: "Those idiots are stupid",
      expectedContains: ["people", "misguided"],
      expectedNotContains: ["idiots", "stupid"],
      expectedMinChangeCount: 2,
    },
    {
      name: "passive-aggressive phrase replacement",
      input: "Per my last email, just a friendly reminder",
      expectedNotContains: ["Per my last email", "friendly reminder"],
      expectedMinChangeCount: 2,
    },
    {
      name: "aggressive phrase replacement",
      input: "You always make mistakes. This is ridiculous.",
      expectedNotContains: ["You always", "ridiculous"],
      expectedMinChangeCount: 2,
    },
  ];

  for (const tc of baselineCases) {
    test(tc.name, () => {
      runCase(tc);
    });
  }
});

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

describe("protected tokens: URLs, @handles, #channels", () => {
  test("preserves URLs with profanity adjacent", () => {
    const result = transformText(
      "Check this shit out: https://example.com/path",
    );

    expect(result.transformed).toContain("https://example.com/path");
    expect(result.transformed).not.toContain("shit");
  });

  test("preserves profanity inside URL path", () => {
    const result = transformText(
      "Visit https://example.com/damn/bullshit for details",
    );

    expect(result.transformed).toBe(
      "Visit https://example.com/damn/bullshit for details",
    );
    expect(result.changeCount).toBe(0);
  });

  test("preserves @handles with profanity adjacent", () => {
    const result = transformText("That fucking @username is awesome");

    expect(result.transformed).toContain("@username");
    expect(result.transformed).not.toContain("fucking");
  });

  test("preserves @handles that contain profanity-like strings", () => {
    const result = transformText("Message @ass-istant about this");

    expect(result.transformed).toBe("Message @ass-istant about this");
    expect(result.changeCount).toBe(0);
  });

  test("preserves #channels with profanity adjacent", () => {
    const result = transformText("Post this shit in #general");

    expect(result.transformed).toContain("#general");
    expect(result.transformed).not.toContain("shit");
  });

  test("preserves #channels that contain profanity-like strings", () => {
    const result = transformText("Check #damn-updates for info");

    expect(result.transformed).toBe("Check #damn-updates for info");
    expect(result.changeCount).toBe(0);
  });

  test("preserves multiple protected tokens in same text", () => {
    const result = transformText(
      "This is bullshit @alice, check https://example.com and post in #team",
    );

    expect(result.transformed).toContain("@alice");
    expect(result.transformed).toContain("https://example.com");
    expect(result.transformed).toContain("#team");
    expect(result.transformed).not.toContain("bullshit");
  });

  test("preserves http URLs (not just https)", () => {
    const result = transformText(
      "Damn, see http://example.org/shit for details",
    );

    expect(result.transformed).toContain("http://example.org/shit");
    expect(result.transformed).not.toContain("Damn");
  });

  test("handles profanity between protected tokens", () => {
    const result = transformText("From @alice to @bob: this is shit");

    expect(result.transformed).toContain("@alice");
    expect(result.transformed).toContain("@bob");
    expect(result.transformed).not.toContain("shit");
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
