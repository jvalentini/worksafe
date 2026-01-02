import { transformText } from "./src/lib/replacer";

console.log("\n=== Test 1: Yeah, sure (sarcasm mode) ===");
const test1 = transformText("Yeah, sure, I can help with that.", {
  sarcasmMode: true,
});
console.log("Changes:", test1.changeCount);
console.log("Transformed:", test1.transformed);
console.log("Detections:", JSON.stringify(test1.changes, null, 2));

console.log("\n=== Test 2: Aggressive phrases ===");
const test2 = transformText(
  "You always mess up. Why can't you understand? This is ridiculous.",
);
console.log("Changes:", test2.changeCount);
console.log("Transformed:", test2.transformed);
console.log("Detections:", JSON.stringify(test2.changes, null, 2));

console.log("\n=== Test 3: Protected tokens (#channels) ===");
const test3 = transformText(
  "This is ridiculous. Post in #general please. That was terrible.",
);
console.log("Changes:", test3.changeCount);
console.log("Transformed:", test3.transformed);
console.log("Detections:", JSON.stringify(test3.changes, null, 2));
