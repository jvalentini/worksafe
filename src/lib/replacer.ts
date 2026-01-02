import { type Detection, detectIssues } from "./detector";

export interface TransformResult {
  original: string;
  transformed: string;
  changes: Detection[];
  changeCount: number;
}

export function transformText(text: string): TransformResult {
  const detections = detectIssues(text);

  if (detections.length === 0) {
    return {
      original: text,
      transformed: text,
      changes: [],
      changeCount: 0,
    };
  }

  let transformed = "";
  let lastIndex = 0;

  for (const detection of detections) {
    transformed += text.slice(lastIndex, detection.startIndex);
    transformed += detection.replacement;
    lastIndex = detection.endIndex;
  }

  transformed += text.slice(lastIndex);

  return {
    original: text,
    transformed,
    changes: detections,
    changeCount: detections.length,
  };
}

export function formatAsEmail(text: string): string {
  const lines = text.split("\n").filter((line) => line.trim());

  if (lines.length === 0) return text;

  let email = "";
  const firstLine = lines[0];

  if (
    firstLine &&
    !firstLine.toLowerCase().startsWith("hi") &&
    !firstLine.toLowerCase().startsWith("hello") &&
    !firstLine.toLowerCase().startsWith("dear")
  ) {
    email += "Hi,\n\n";
  }

  email += lines.join("\n\n");

  const lastLine = lines[lines.length - 1];
  if (
    lastLine &&
    !lastLine.toLowerCase().includes("thanks") &&
    !lastLine.toLowerCase().includes("regards") &&
    !lastLine.toLowerCase().includes("best") &&
    !lastLine.toLowerCase().includes("sincerely")
  ) {
    email += "\n\nBest regards";
  }

  return email;
}

export function getChangeSummary(changes: Detection[]): string {
  if (changes.length === 0) {
    return "No changes needed - your text is already professional!";
  }

  const typeCounts: Record<Detection["type"], number> = {
    profanity: 0,
    insult: 0,
    aggressive: 0,
    "passive-aggressive": 0,
    "persuasion-hedging": 0,
    "persuasion-apologies": 0,
    "persuasion-qualifiers": 0,
    "persuasion-commitments": 0,
    "persuasion-validation": 0,
    "persuasion-followups": 0,
  };

  for (const change of changes) {
    typeCounts[change.type]++;
  }

  const parts: string[] = [];

  if (typeCounts.profanity > 0) {
    parts.push(`${typeCounts.profanity} profanity`);
  }
  if (typeCounts.insult > 0) {
    parts.push(
      `${typeCounts.insult} insult${typeCounts.insult > 1 ? "s" : ""}`,
    );
  }
  if (typeCounts.aggressive > 0) {
    parts.push(
      `${typeCounts.aggressive} aggressive phrase${typeCounts.aggressive > 1 ? "s" : ""}`,
    );
  }
  if (typeCounts["passive-aggressive"] > 0) {
    parts.push(
      `${typeCounts["passive-aggressive"]} passive-aggressive phrase${typeCounts["passive-aggressive"] > 1 ? "s" : ""}`,
    );
  }

  const pluralize = (
    count: number,
    singular: string,
    plural = `${singular}s`,
  ): string => (count === 1 ? singular : plural);

  const persuasionParts: string[] = [];

  if (typeCounts["persuasion-hedging"] > 0) {
    const count = typeCounts["persuasion-hedging"];
    persuasionParts.push(`${count} ${pluralize(count, "hedging", "hedging")}`);
  }
  if (typeCounts["persuasion-apologies"] > 0) {
    const count = typeCounts["persuasion-apologies"];
    persuasionParts.push(
      `${count} ${pluralize(count, "apology", "apologies")}`,
    );
  }
  if (typeCounts["persuasion-qualifiers"] > 0) {
    const count = typeCounts["persuasion-qualifiers"];
    persuasionParts.push(`${count} ${pluralize(count, "qualifier")}`);
  }
  if (typeCounts["persuasion-commitments"] > 0) {
    const count = typeCounts["persuasion-commitments"];
    persuasionParts.push(`${count} ${pluralize(count, "commitment")}`);
  }
  if (typeCounts["persuasion-validation"] > 0) {
    const count = typeCounts["persuasion-validation"];
    persuasionParts.push(
      `${count} ${pluralize(count, "validation", "validation")}`,
    );
  }
  if (typeCounts["persuasion-followups"] > 0) {
    const count = typeCounts["persuasion-followups"];
    persuasionParts.push(
      `${count} ${pluralize(count, "follow-up", "follow-ups")}`,
    );
  }

  if (persuasionParts.length > 0) {
    parts.push(`persuasion (${persuasionParts.join(", ")})`);
  }

  return `Transformed ${parts.join(", ")}`;
}
