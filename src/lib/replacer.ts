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

  const typeCounts = {
    profanity: 0,
    insult: 0,
    aggressive: 0,
    "passive-aggressive": 0,
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

  return `Transformed ${parts.join(", ")}`;
}
