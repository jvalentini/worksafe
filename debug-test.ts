import { transformText } from "./src/lib/replacer";
import { segmentSentences } from "./src/lib/detector";

const tests = [
  {
    name: "Sentence with protected token embedded",
    input: "This is ridiculous @alice. That was terrible.",
    expected: {
      changeCount: 1,
      firstType: "clause-rewrite-frustration",
    }
  }
];

for (const test of tests) {
  console.log("\n" + "=".repeat(60));
  console.log(test.name);
  console.log("=".repeat(60));
  console.log("Input:", JSON.stringify(test.input));
  
  const sentences = segmentSentences(test.input);
  console.log("\nSentence segmentation:");
  sentences.forEach((s, i) => {
    const text = test.input.slice(s.startIndex, s.endIndex);
    console.log(`  Sentence ${i}: [${s.startIndex}-${s.endIndex}] = ${JSON.stringify(text)}`);
  });
  
  const result = transformText(test.input);
  console.log("\nResult:");
  console.log("  Change count:", result.changeCount, test.expected.changeCount === result.changeCount ? "✓" : "✗ EXPECTED " + test.expected.changeCount);
  console.log("  Changes:");
  result.changes.forEach((c, i) => {
    console.log(`    ${i}: type=${c.type}, original=${JSON.stringify(c.original)}, [${c.startIndex}-${c.endIndex}]`);
  });
  console.log("  Transformed:", JSON.stringify(result.transformed));
  console.log("  Contains @alice:", result.transformed.includes("@alice") ? "YES" : "NO");
}
