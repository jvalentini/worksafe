<script setup lang="ts">
import { ref } from "vue";
import { hasApiKey, rewriteWithAI } from "./lib/ai-rewriter";
import type { Detection } from "./lib/detector";
import { formatAsEmail, getChangeSummary, transformText } from "./lib/replacer";

const inputText = ref("");
const outputText = ref("");
const emailOutput = ref("");
const changeSummary = ref("");
const changes = ref<Detection[]>([]);
const isProcessing = ref(false);
const aiMode = ref(false);
const showStamp = ref(false);

async function handleTransform(text: string) {
  if (!text.trim()) return;

  inputText.value = text;
  isProcessing.value = true;
  showStamp.value = false;

  try {
    if (aiMode.value && hasApiKey()) {
      const result = await rewriteWithAI(text);

      if (result.success && result.rewritten) {
        outputText.value = result.rewritten;
        emailOutput.value = formatAsEmail(result.rewritten);
        changeSummary.value = "PROCESSED BY AI DIVISION";
        changes.value = [];
      } else {
        // Fallback to dictionary mode
        const dictResult = transformText(text);
        outputText.value = dictResult.transformed;
        emailOutput.value = formatAsEmail(dictResult.transformed);
        changeSummary.value = `AI UNAVAILABLE. ${getChangeSummary(dictResult.changes)}`;
        changes.value = dictResult.changes;
      }
    } else {
      const result = transformText(text);
      outputText.value = result.transformed;
      emailOutput.value = formatAsEmail(result.transformed);
      changeSummary.value = getChangeSummary(result.changes);
      changes.value = result.changes;
    }

    // Trigger stamp animation
    setTimeout(() => {
      showStamp.value = true;
    }, 100);
  } catch (error) {
    console.error("Processing error:", error);
    const result = transformText(text);
    outputText.value = result.transformed;
    emailOutput.value = formatAsEmail(result.transformed);
    changeSummary.value = getChangeSummary(result.changes);
    changes.value = result.changes;
  } finally {
    isProcessing.value = false;
  }
}
</script>

<template>
  <div class="office-container">
    <!-- Decorative elements -->
    <div class="coffee-stain coffee-stain-1"></div>
    <div class="coffee-stain coffee-stain-2"></div>
    <div class="paper-clip"></div>
    
    <div class="document">
      <div class="document-holes">
        <div class="hole"></div>
        <div class="hole"></div>
        <div class="hole"></div>
      </div>
      
      <div class="document-body">
        <h1>WorkSafe Corporate Dystopia</h1>
        <p>Vue 3 + TypeScript interface successfully implemented!</p>
        <p>Time: {{ new Date().toLocaleTimeString() }}</p>
      </div>
      
      <footer class="document-footer">
        <p>FORM WS-2024 REV. 3 | DEPT. OF PROFESSIONAL COMMUNICATIONS</p>
        <p class="footer-small">All processing occurs locally unless AI Division is engaged</p>
      </footer>
    </div>
    
    <!-- Filing cabinet drawer decoration -->
    <div class="filing-drawer">
      <div class="drawer-handle"></div>
      <span class="drawer-label">OUTBOX</span>
    </div>
  </div>
</template>

<style>
@import './styles/corporate-dystopia.css';
</style>