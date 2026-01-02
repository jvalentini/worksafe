import { describe, expect, test } from "bun:test";

import { formatAsEmail, getChangeSummary, transformText } from "./replacer";
import {
  tokenize,
  computeAdjacencyScore,
  type AdjacencyRule,
} from "./detector";

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

describe("M3: tokenization (pure function)", () => {
  test("tokenizes simple text with positions", () => {
    const text = "Hello world test";
    const masked = text;
    const tokens = tokenize(text, masked);

    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toEqual({
      raw: "Hello",
      normalized: "hello",
      startIndex: 0,
      endIndex: 5,
      isProtected: false,
    });
    expect(tokens[1]).toEqual({
      raw: "world",
      normalized: "world",
      startIndex: 6,
      endIndex: 11,
      isProtected: false,
    });
  });

  test("marks protected tokens: URLs", () => {
    const text = "Check https://example.com for details";
    const masked = text;
    const tokens = tokenize(text, masked);

    const httpsToken = tokens.find((t) => t.raw === "https");
    const exampleToken = tokens.find((t) => t.raw === "example");

    expect(httpsToken?.isProtected).toBe(true);
    expect(exampleToken?.isProtected).toBe(true);
  });

  test("marks protected tokens: @handles", () => {
    const text = "Ask @alice about this";
    const masked = text;
    const tokens = tokenize(text, masked);

    const aliceToken = tokens.find((t) => t.raw === "alice");
    expect(aliceToken?.isProtected).toBe(true);
  });

  test("marks protected tokens: #channels", () => {
    const text = "Post in #general please";
    const masked = text;
    const tokens = tokenize(text, masked);

    const generalToken = tokens.find((t) => t.raw === "general");
    expect(generalToken?.isProtected).toBe(true);
  });

  test("excludes tokens in excluded zones (code blocks)", () => {
    const text = "Normal text\n```\ncode here\n```\nMore text";
    const masked = "Normal text\n   \n         \n   \nMore text";
    const tokens = tokenize(text, masked);

    const codeToken = tokens.find((t) => t.raw === "code");
    const hereToken = tokens.find((t) => t.raw === "here");

    expect(codeToken).toBeUndefined();
    expect(hereToken).toBeUndefined();

    const normalToken = tokens.find((t) => t.raw === "Normal");
    const moreToken = tokens.find((t) => t.raw === "More");

    expect(normalToken).toBeDefined();
    expect(moreToken).toBeDefined();
  });

  test("handles contractions and hyphens", () => {
    const text = "don't well-known";
    const masked = text;
    const tokens = tokenize(text, masked);

    expect(tokens.some((t) => t.raw === "don't")).toBe(true);
    expect(tokens.some((t) => t.raw === "well-known")).toBe(true);
  });
});

describe("M3: adjacency scoring (pure function)", () => {
  test("scores adjacent tokens (distance 0) as 1.0", () => {
    const tokens = tokenize("you idiot", "you idiot");
    const rule: AdjacencyRule = {
      triggerTokens: ["you"],
      targetTokens: ["idiot"],
      maxDistance: 6,
    };

    const score = computeAdjacencyScore(tokens, rule);

    expect(score).not.toBeNull();
    expect(score?.score).toBe(1.0);
    expect(score?.matchedTrigger).toBe("you");
    expect(score?.matchedTarget).toBe("idiot");
  });

  test("scores 1 token apart (distance 1) as 0.5", () => {
    const tokens = tokenize("you are idiot", "you are idiot");
    const rule: AdjacencyRule = {
      triggerTokens: ["you"],
      targetTokens: ["idiot"],
      maxDistance: 6,
    };

    const score = computeAdjacencyScore(tokens, rule);

    expect(score).not.toBeNull();
    expect(score?.score).toBe(0.5);
  });

  test("scores 2 tokens apart (distance 2) as ~0.33", () => {
    const tokens = tokenize("you are an idiot", "you are an idiot");
    const rule: AdjacencyRule = {
      triggerTokens: ["you"],
      targetTokens: ["idiot"],
      maxDistance: 6,
    };

    const score = computeAdjacencyScore(tokens, rule);

    expect(score).not.toBeNull();
    expect(score?.score).toBeCloseTo(0.333, 2);
  });

  test("returns null when distance exceeds window", () => {
    const tokens = tokenize(
      "you are very very very very very stupid",
      "you are very very very very very stupid",
    );
    const rule: AdjacencyRule = {
      triggerTokens: ["you"],
      targetTokens: ["stupid"],
      maxDistance: 3,
    };

    const score = computeAdjacencyScore(tokens, rule);

    expect(score).toBeNull();
  });

  test("protected tokens act as barriers", () => {
    const text = "you https://example.com stupid";
    const masked = text;
    const tokens = tokenize(text, masked);

    const rule: AdjacencyRule = {
      triggerTokens: ["you"],
      targetTokens: ["stupid"],
      maxDistance: 6,
    };

    const score = computeAdjacencyScore(tokens, rule);

    expect(score).toBeNull();
  });

  test("returns best score when multiple matches exist", () => {
    const tokens = tokenize("you stupid idiot", "you stupid idiot");
    const rule: AdjacencyRule = {
      triggerTokens: ["you"],
      targetTokens: ["stupid", "idiot"],
      maxDistance: 6,
    };

    const score = computeAdjacencyScore(tokens, rule);

    expect(score).not.toBeNull();
    expect(score?.score).toBe(1.0);
    expect(score?.matchedTarget).toBe("stupid");
  });

  test("deterministic scoring with same input", () => {
    const tokens = tokenize("you are stupid", "you are stupid");
    const rule: AdjacencyRule = {
      triggerTokens: ["you"],
      targetTokens: ["stupid"],
      maxDistance: 6,
    };

    const score1 = computeAdjacencyScore(tokens, rule);
    const score2 = computeAdjacencyScore(tokens, rule);

    expect(score1).toEqual(score2);
  });
});

describe("M3: passive-aggressive adjacency detection", () => {
  test("detects 'just checking in' with extra words", () => {
    const result = transformText("Just wanted to be checking in on this");

    expect(result.changeCount).toBeGreaterThanOrEqual(1);
    const paChange = result.changes.find(
      (c) => c.type === "passive-aggressive",
    );
    expect(paChange).toBeDefined();
    expect(paChange?.original.toLowerCase()).toContain("just");
    expect(paChange?.original.toLowerCase()).toContain("checking");
    expect(paChange?.original.toLowerCase()).toContain("in");
  });

  test("detects 'just checking in' with punctuation", () => {
    const result = transformText("Just, um, checking... in");

    expect(result.changeCount).toBeGreaterThanOrEqual(1);
    const paChange = result.changes.find(
      (c) => c.type === "passive-aggressive",
    );
    expect(paChange).toBeDefined();
  });

  test("detects 'per my last email' with extra words", () => {
    const result = transformText("Per my very last email message");

    expect(result.changeCount).toBeGreaterThanOrEqual(1);
    const paChange = result.changes.find(
      (c) => c.type === "passive-aggressive",
    );
    expect(paChange).toBeDefined();
    expect(paChange?.original.toLowerCase()).toContain("per");
    expect(paChange?.original.toLowerCase()).toContain("my");
    expect(paChange?.original.toLowerCase()).toContain("last");
    expect(paChange?.original.toLowerCase()).toContain("email");
  });

  test("detects 'per my last email' with punctuation", () => {
    const result = transformText("Per my, uh, last email");

    expect(result.changeCount).toBeGreaterThanOrEqual(1);
    const paChange = result.changes.find(
      (c) => c.type === "passive-aggressive",
    );
    expect(paChange).toBeDefined();
  });

  test("detects 'friendly reminder' with extra words", () => {
    const result = transformText("Just a friendly little reminder");

    expect(result.changeCount).toBeGreaterThanOrEqual(1);
    const paChange = result.changes.find(
      (c) => c.type === "passive-aggressive",
    );
    expect(paChange).toBeDefined();
    expect(paChange?.original).toContain("friendly");
    expect(paChange?.original).toContain("reminder");
  });

  test("does not detect when tokens are too far apart", () => {
    const result = transformText(
      "Just want to say something completely different before checking in",
    );

    const paChange = result.changes.find(
      (c) =>
        c.type === "passive-aggressive" &&
        c.original.includes("just") &&
        c.original.includes("checking"),
    );
    expect(paChange).toBeUndefined();
  });

  test("does not detect across protected tokens (URLs)", () => {
    const result = transformText("Just https://example.com checking in");

    const paChange = result.changes.find(
      (c) =>
        c.type === "passive-aggressive" &&
        c.original.includes("just") &&
        c.original.includes("checking"),
    );
    expect(paChange).toBeUndefined();
  });

  test("does not detect across protected tokens (@handles)", () => {
    const result = transformText("Friendly @alice reminder");

    const paChange = result.changes.find(
      (c) =>
        c.type === "passive-aggressive" &&
        c.original.includes("friendly") &&
        c.original.includes("reminder"),
    );
    expect(paChange).toBeUndefined();
  });

  test("does not detect in excluded zones (code blocks)", () => {
    const result = transformText("```\nJust checking in\n```");

    const paChange = result.changes.find(
      (c) => c.type === "passive-aggressive",
    );
    expect(paChange).toBeUndefined();
  });

  test("does not detect in excluded zones (quoted text)", () => {
    const result = transformText("> Just checking in");

    const paChange = result.changes.find(
      (c) => c.type === "passive-aggressive",
    );
    expect(paChange).toBeUndefined();
  });

  test("existing exact phrase regex still works", () => {
    const result = transformText("Per my last email, here is the info");

    expect(result.changeCount).toBeGreaterThanOrEqual(1);
    expect(result.transformed).not.toContain("Per my last email");
  });

  test("existing friendly reminder regex still works", () => {
    const result = transformText("Friendly reminder about the meeting");

    expect(result.changeCount).toBeGreaterThanOrEqual(1);
    expect(result.transformed).not.toContain("Friendly reminder");
  });
});

describe("M3: adjacency-based clause rewrites (integration)", () => {
  test("triggers attack rewrite via adjacency (no exact phrase match)", () => {
    const result = transformText("You know what stupid");

    expect(result.changeCount).toBe(1);
    expect(result.changes[0]?.type).toBe("clause-rewrite-attack");
    expect(result.transformed).toBe(
      "I'm concerned about this situation and would like to work through it together.",
    );
  });

  test("triggers frustration rewrite via adjacency", () => {
    const result = transformText("This seems ridiculous");

    expect(result.changeCount).toBe(1);
    expect(result.changes[0]?.type).toBe("clause-rewrite-frustration");
    expect(result.transformed).toBe(
      "This situation is concerning. I'd like to explore solutions to address it.",
    );
  });

  test("does not trigger when distance exceeds window", () => {
    const result = transformText(
      "Someone made a choice to implement various systems and your approach incorporates several elements finally resulting in something moronic",
    );

    expect(
      result.changes.every((c) => c.type !== "clause-rewrite-attack"),
    ).toBe(true);
    expect(result.transformed).toContain("poorly thought out");
  });

  test("adjacency blocked by protected token (@handle)", () => {
    const result = transformText("You @alice stupid");

    expect(
      result.changes.every((c) => c.type !== "clause-rewrite-attack"),
    ).toBe(true);
  });

  test("adjacency blocked by protected token (URL)", () => {
    const result = transformText("This https://example.com ridiculous");

    expect(
      result.changes.every((c) => c.type !== "clause-rewrite-frustration"),
    ).toBe(true);
  });

  test("adjacency works with 'your' trigger", () => {
    const result = transformText("Your implementation idiotic");

    expect(result.changeCount).toBe(1);
    expect(result.changes[0]?.type).toBe("clause-rewrite-attack");
  });

  test("adjacency works with 'that' and 'it' triggers", () => {
    const result1 = transformText("That approach terrible");
    expect(result1.changes[0]?.type).toBe("clause-rewrite-frustration");

    const result2 = transformText("It seems awful");
    expect(result2.changes[0]?.type).toBe("clause-rewrite-frustration");
  });
});

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
  test("summarizes counts by type for clause rewrite", () => {
    const result = transformText("This is ridiculous");
    expect(getChangeSummary(result.changes)).toBe(
      "Transformed 1 frustration statement",
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

describe("clause rewrites: direct attack pattern", () => {
  test("rewrites sentence with 'you + insult' pattern", () => {
    const result = transformText("You are such an idiot.");

    expect(result.transformed).toBe(
      "I'm concerned about this situation and would like to work through it together.",
    );
    expect(result.changeCount).toBe(1);
    expect(result.changes[0]?.type).toBe("clause-rewrite-attack");
  });

  test("rewrites sentence with 'your + insult' pattern", () => {
    const result = transformText("Your stupid decisions are killing us.");

    expect(result.transformed).toBe(
      "I'm concerned about this situation and would like to work through it together.",
    );
    expect(result.changeCount).toBe(1);
    expect(result.changes[0]?.type).toBe("clause-rewrite-attack");
  });

  test("rewrites multi-insult attack sentence", () => {
    const result = transformText(
      "You idiots are completely incompetent morons.",
    );

    expect(result.transformed).toBe(
      "I'm concerned about this situation and would like to work through it together.",
    );
    expect(result.changeCount).toBe(1);
    expect(result.changes[0]?.type).toBe("clause-rewrite-attack");
  });

  test("preserves protected tokens in attack sentences", () => {
    const result = transformText(
      "You stupid idiots need to check https://example.com/docs right now.",
    );

    expect(result.transformed).toContain("https://example.com/docs");
    expect(
      result.changes.every((c) => c.type !== "clause-rewrite-attack"),
    ).toBe(true);
  });

  test("does not rewrite attack in excluded zone (quoted email)", () => {
    const result = transformText(
      "> You idiots messed this up.\nI disagree with this assessment.",
    );

    expect(result.transformed).toContain("> You idiots messed this up.");
    expect(
      result.changes.every((c) => c.type !== "clause-rewrite-attack"),
    ).toBe(true);
  });

  test("does not rewrite attack in excluded zone (code block)", () => {
    const result = transformText(
      "```\nYou idiots broke the build.\n```\nPlease review.",
    );

    expect(result.transformed).toContain("You idiots broke the build.");
    expect(
      result.changes.every((c) => c.type !== "clause-rewrite-attack"),
    ).toBe(true);
  });

  test("does not rewrite attack in excluded zone (quoted email)", () => {
    const result = transformText(
      "> You idiots messed this up.\nI disagree with this assessment.",
    );

    // Quoted line should remain unchanged
    expect(result.transformed).toContain("> You idiots messed this up.");
    expect(
      result.changes.every((c) => c.type !== "clause-rewrite-attack"),
    ).toBe(true);
  });

  test("does not rewrite attack in excluded zone (code block)", () => {
    const result = transformText(
      "```\nYou idiots broke the build.\n```\nPlease review.",
    );

    // Code block should remain unchanged
    expect(result.transformed).toContain("You idiots broke the build.");
    expect(
      result.changes.every((c) => c.type !== "clause-rewrite-attack"),
    ).toBe(true);
  });

  test("groups consecutive attack sentences into one rewrite", () => {
    const result = transformText(
      "You are an idiot. Your stupid mistakes cost us.",
    );

    expect(result.changeCount).toBe(1);
    expect(result.changes[0]?.type).toBe("clause-rewrite-attack");
    expect(result.changes[0]?.original).toBe(
      "You are an idiot. Your stupid mistakes cost us.",
    );
    expect(result.transformed).toBe(
      "I'm concerned about this situation and would like to work through it together.",
    );
  });
});

describe("clause rewrites: frustration pattern", () => {
  test("rewrites 'this is + negative' frustration", () => {
    const result = transformText("This is ridiculous.");

    expect(result.transformed).toBe(
      "This situation is concerning. I'd like to explore solutions to address it.",
    );
    expect(result.changeCount).toBe(1);
    expect(result.changes[0]?.type).toBe("clause-rewrite-frustration");
  });

  test("rewrites 'that was + negative' frustration", () => {
    const result = transformText("That was completely unacceptable.");

    expect(result.transformed).toBe(
      "This situation is concerning. I'd like to explore solutions to address it.",
    );
    expect(result.changeCount).toBe(1);
    expect(result.changes[0]?.type).toBe("clause-rewrite-frustration");
  });

  test("rewrites 'it is + negative' frustration", () => {
    const result = transformText("It is absolutely terrible.");

    expect(result.transformed).toBe(
      "This situation is concerning. I'd like to explore solutions to address it.",
    );
    expect(result.changeCount).toBe(1);
    expect(result.changes[0]?.type).toBe("clause-rewrite-frustration");
  });

  test("rewrites with various negative descriptors", () => {
    const negativeInputs = [
      "This is absurd.",
      "That was awful.",
      "It is horrible.",
      "This is garbage.",
      "That was useless.",
      "It is pathetic.",
    ];

    for (const input of negativeInputs) {
      const result = transformText(input);
      expect(result.changes[0]?.type).toBe("clause-rewrite-frustration");
      expect(result.transformed).toBe(
        "This situation is concerning. I'd like to explore solutions to address it.",
      );
    }
  });

  test("preserves protected tokens in frustration sentences", () => {
    const result = transformText(
      "This is ridiculous @alice, check #general now.",
    );

    expect(result.transformed).toContain("@alice");
    expect(result.transformed).toContain("#general");
    expect(
      result.changes.every((c) => c.type !== "clause-rewrite-frustration"),
    ).toBe(true);
  });

  test("does not rewrite frustration in excluded zone (quoted email)", () => {
    const result = transformText(
      "> This is ridiculous.\nI understand your concern.",
    );

    expect(result.transformed).toContain("> This is ridiculous.");
    expect(
      result.changes.every((c) => c.type !== "clause-rewrite-frustration"),
    ).toBe(true);
  });

  test("does not rewrite frustration in excluded zone (code fence)", () => {
    const result = transformText(
      "```python\n# This is terrible code\nprint('hello')\n```",
    );

    expect(result.transformed).toContain("This is terrible code");
  });

  test("groups consecutive frustration sentences into one rewrite", () => {
    const result = transformText("This is awful. That was terrible.");

    expect(result.changeCount).toBe(1);
    expect(result.changes[0]?.type).toBe("clause-rewrite-frustration");
    expect(result.changes[0]?.original).toBe(
      "This is awful. That was terrible.",
    );
    expect(result.transformed).toBe(
      "This situation is concerning. I'd like to explore solutions to address it.",
    );
  });
});

describe("clause rewrites: integration with word replacements", () => {
  test("clause rewrite overrides word-level profanity replacement", () => {
    const result = transformText("You are a fucking idiot.");

    expect(result.transformed).toBe(
      "I'm concerned about this situation and would like to work through it together.",
    );
    expect(result.changeCount).toBe(1);
    expect(result.changes[0]?.type).toBe("clause-rewrite-attack");
  });

  test("word replacements apply when clause rewrite conditions not met", () => {
    const result = transformText("That meeting was shit.");

    expect(result.transformed).toContain("stuff");
    expect(result.transformed).not.toContain("shit");
    expect(result.changes[0]?.type).toBe("profanity");
  });

  test("clause rewrite + word replacement in different sentences", () => {
    const result = transformText(
      "You are stupid. The code is broken but fixable.",
    );

    expect(result.changes[0]?.type).toBe("clause-rewrite-attack");
    expect(result.transformed).toContain(
      "I'm concerned about this situation and would like to work through it together.",
    );
  });
});

describe("integration: full text transformation", () => {
  test("handles README example input with clause rewrites", () => {
    const input =
      "This is bullshit. Why can't you idiots figure this out? I'm sick of explaining the same shit.";
    const result = transformText(input);

    expect(result.transformed).not.toContain("bullshit");
    expect(result.transformed).not.toContain("idiots");
    expect(result.transformed).not.toContain("shit");
    expect(result.changeCount).toBeGreaterThanOrEqual(2);
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

describe("M2: collapse consecutive negative sentences", () => {
  test("groups 2 consecutive attack sentences", () => {
    const result = transformText("You are an idiot. You are so stupid.");

    expect(result.changeCount).toBe(1);
    expect(result.changes[0]?.type).toBe("clause-rewrite-attack");
    expect(result.changes[0]?.original).toBe(
      "You are an idiot. You are so stupid.",
    );
    expect(result.transformed).toBe(
      "I'm concerned about this situation and would like to work through it together.",
    );
  });

  test("groups 3 consecutive frustration sentences", () => {
    const result = transformText(
      "This is ridiculous. That was awful. It is terrible.",
    );

    expect(result.changeCount).toBe(1);
    expect(result.changes[0]?.type).toBe("clause-rewrite-frustration");
    expect(result.changes[0]?.original).toBe(
      "This is ridiculous. That was awful. It is terrible.",
    );
    expect(result.transformed).toBe(
      "This situation is concerning. I'd like to explore solutions to address it.",
    );
  });

  test("groups mixed attack and frustration as attack", () => {
    const result = transformText("You are an idiot. This is terrible.");

    expect(result.changeCount).toBe(1);
    expect(result.changes[0]?.type).toBe("clause-rewrite-attack");
    expect(result.transformed).toBe(
      "I'm concerned about this situation and would like to work through it together.",
    );
  });

  test("does NOT group across quoted lines", () => {
    const result = transformText(
      "This is ridiculous.\n> You are an idiot.\nThat was terrible.",
    );

    expect(result.changeCount).toBe(2);
    expect(result.transformed).toContain("> You are an idiot.");
    const frustrationChanges = result.changes.filter(
      (c) => c.type === "clause-rewrite-frustration",
    );
    expect(frustrationChanges).toHaveLength(2);
  });

  test("does NOT group across code fences", () => {
    const result = transformText(
      "This is ridiculous.\n```\ncode here\n```\nThat was terrible.",
    );

    expect(result.changeCount).toBe(2);
    expect(result.transformed).toContain("```\ncode here\n```");
    const frustrationChanges = result.changes.filter(
      (c) => c.type === "clause-rewrite-frustration",
    );
    expect(frustrationChanges).toHaveLength(2);
  });

  test("does NOT group across protected tokens (URLs)", () => {
    const result = transformText(
      "This is ridiculous. Check https://example.com for details. That was terrible.",
    );

    expect(result.changeCount).toBe(2);
    expect(result.transformed).toContain("https://example.com");
  });

  test("does NOT group across protected tokens (@handles)", () => {
    const result = transformText(
      "This is ridiculous. Ask @alice about this. That was terrible.",
    );

    expect(result.changeCount).toBe(2);
    expect(result.transformed).toContain("@alice");
  });

  test("does NOT group across protected tokens (#channels)", () => {
    const result = transformText(
      "This is ridiculous. Post in #general please. That was terrible.",
    );

    expect(result.changeCount).toBe(2);
    expect(result.transformed).toContain("#general");
  });

  test("does NOT group sentences with protected tokens embedded", () => {
    const result = transformText(
      "This is ridiculous @alice. That was terrible.",
    );

    expect(result.changeCount).toBe(1);
    const frustrationChanges = result.changes.filter(
      (c) => c.type === "clause-rewrite-frustration",
    );
    expect(frustrationChanges).toHaveLength(1);
    expect(result.transformed).toContain("@alice");
  });

  test("groups sentences separated only by whitespace", () => {
    const result = transformText("This is ridiculous.\n\nThat was terrible.");

    expect(result.changeCount).toBe(1);
    expect(result.changes[0]?.original).toBe(
      "This is ridiculous.\n\nThat was terrible.",
    );
  });

  test("does NOT group if normal text between them", () => {
    const result = transformText(
      "This is ridiculous. Some normal text here. That was terrible.",
    );

    expect(result.changeCount).toBe(2);
    expect(result.transformed).toContain("Some normal text here.");
  });
});
