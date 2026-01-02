import { transformText } from "./src/lib/replacer";

const text1 = "Just wanted to be checking in on this";
console.log("\n=== Test 1:", text1, "===");
const result1 = transformText(text1);
console.log("Changes:", JSON.stringify(result1.changes, null, 2));

const text2 = "Just checking in on this";
console.log("\n=== Test 2:", text2, "===");
const result2 = transformText(text2);
console.log("Changes:", JSON.stringify(result2.changes, null, 2));
