<template>
  <section class="output-section">
    <div class="section-header">
      <span class="section-id">FORM 03</span>
      <h2>PROFESSIONAL OUTPUT</h2>
      <div class="stamp-row">
        <span class="stamp tps">TPS COMPLIANT</span>
      </div>
    </div>

    <div class="output-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: outputMode === 'plain' }"
        @click="setMode('plain')"
      >
        📄 PLAIN TEXT
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: outputMode === 'email' }"
        @click="setMode('email')"
      >
        ✉️ EMAIL FORMAT
      </button>
    </div>

    <div class="output-document" v-if="outputMode === 'plain'">
      <div class="document-paper">
        <div v-if="transformedPlain" class="output-text">{{ transformedPlain }}</div>
        <div v-else class="placeholder">
          <span class="placeholder-icon">📋</span>
          <span>AWAITING INPUT DATA...</span>
        </div>
      </div>
      <button 
        v-if="transformedPlain" 
        class="copy-btn"
        @click="copyText(transformedPlain)"
      >
        {{ copied ? '✓ COPIED!' : '📋 COPY TO CLIPBOARD' }}
      </button>
    </div>

    <div class="output-document email" v-if="outputMode === 'email'">
      <div class="document-paper">
        <div v-if="transformedEmail" class="output-text email-style">{{ transformedEmail }}</div>
        <div v-else class="placeholder">
          <span class="placeholder-icon">✉️</span>
          <span>AWAITING INPUT DATA...</span>
        </div>
      </div>
      <button 
        v-if="transformedEmail" 
        class="copy-btn"
        @click="copyText(transformedEmail)"
      >
        {{ copied ? '✓ COPIED!' : '📋 COPY TO CLIPBOARD' }}
      </button>
    </div>

    <div v-if="changes && changes.length > 0" class="changes-log">
      <div class="log-header">
        <span class="log-title">📝 MODIFICATION LOG</span>
        <span class="log-count">{{ changes.length }} CHANGE(S)</span>
      </div>
      <div class="changes-list">
        <div v-for="(change, i) in changes" :key="i" class="change-row">
          <span class="change-original">"{{ change.original }}"</span>
          <span class="arrow">→</span>
          <span class="change-new">"{{ change.replacement }}"</span>
        </div>
      </div>
    </div>

    <div v-else-if="transformedPlain" class="compliance-notice">
      <span class="notice-icon">✅</span>
      NO MODIFICATIONS REQUIRED - TEXT ALREADY COMPLIANT
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { transformedPlain, transformedEmail, changes } from "$lib/state";

const outputMode = ref<"plain" | "email">("plain");
const copied = ref(false);

function setMode(mode: "plain" | "email") {
  outputMode.value = mode;
}

function resetCopied() {
  copied.value = false;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
    setTimeout(resetCopied, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
}
</script>

<style scoped>
.output-section {
  background: linear-gradient(145deg, #fff740 0%, #fff176 60%, #ffee58 100%);
  border: none;
  padding: 1.5rem;
  position: relative;
  box-shadow: 
    3px 4px 8px rgba(0,0,0,0.25),
    -1px -1px 0 rgba(255,255,255,0.5) inset;
  transform: rotate(-0.5deg);
}

.output-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: rgba(0,0,0,0.08);
}

.output-section::after {
  content: "";
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0 25px 25px;
  border-color: transparent transparent rgba(0,0,0,0.15) transparent;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px dashed #d4a700;
  flex-wrap: wrap;
}

.section-id {
  font-family: 'VT323', monospace;
  font-size: 0.9rem;
  background: #5d4037;
  color: #fff740;
  padding: 0.25rem 0.5rem;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.section-header h2 {
  font-family: 'Courier Prime', monospace;
  font-size: 1rem;
  font-weight: bold;
  letter-spacing: 0.1em;
  color: #5d4037;
  margin: 0;
  flex: 1;
}

.stamp-row {
  display: flex;
  gap: 0.5rem;
}

.stamp {
  font-family: 'Special Elite', monospace;
  font-size: 0.7rem;
  font-weight: bold;
  letter-spacing: 0.1em;
  padding: 0.3rem 0.6rem;
  border: 2px solid currentColor;
  transform: rotate(-4deg);
}

.stamp.tps {
  color: #166534;
}

.output-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 0;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  font-family: 'VT323', monospace;
  font-size: 1rem;
  letter-spacing: 0.1em;
  background: rgba(255,255,255,0.3);
  border: 2px solid #d4a700;
  border-bottom: none;
  color: #5d4037;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 1px 0 3px rgba(0,0,0,0.1);
  position: relative;
  z-index: 1;
}

.tab-btn:first-child {
  border-right: none;
}

.tab-btn.active {
  background: rgba(255,255,255,0.6);
  color: #5d4037;
  font-weight: bold;
  z-index: 2;
}

.tab-btn:hover:not(.active) {
  background: rgba(255,255,255,0.4);
}

.output-document {
  margin-bottom: 1rem;
  margin-top: 0;
}

.document-paper {
  background: rgba(255,255,255,0.4);
  border: 2px solid #d4a700;
  border-top: none;
  padding: 1.5rem;
  min-height: 150px;
  box-shadow: inset 0 0 30px rgba(0,0,0,0.05);
  position: relative;
}

.document-paper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 30px;
  bottom: 0;
  width: 1px;
  background: #d4a700;
  opacity: 0.3;
}

.output-text {
  font-family: 'VT323', monospace;
  font-size: 1.15rem;
  line-height: 1.7;
  color: #5d4037;
  white-space: pre-wrap;
  word-break: break-word;
  padding-left: 20px;
}

.output-text.email-style {
  font-family: 'Courier Prime', monospace;
  font-size: 1rem;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 100px;
  font-family: 'VT323', monospace;
  font-size: 1rem;
  color: rgba(93,64,55,0.5);
}

.placeholder-icon {
  font-size: 2rem;
  opacity: 0.5;
}

.copy-btn {
  display: block;
  width: 100%;
  padding: 0.75rem;
  font-family: 'VT323', monospace;
  font-size: 1rem;
  letter-spacing: 0.1em;
  background: linear-gradient(180deg, #43a047 0%, #2e7d32 100%);
  color: white;
  border: 2px solid #1b5e20;
  box-shadow: 0 3px 0 #1b5e20;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  top: 0;
}

.copy-btn:hover {
  background: linear-gradient(180deg, #4caf50 0%, #43a047 100%);
}

.copy-btn:active {
  top: 3px;
  box-shadow: 0 0 0 #1b5e20;
}

.changes-log {
  background: rgba(255,255,255,0.3);
  border: 1px dashed #d4a700;
  padding: 1rem;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #d4a700;
}

.log-title {
  font-family: 'VT323', monospace;
  font-size: 0.9rem;
  color: #5d4037;
  letter-spacing: 0.1em;
}

.log-count {
  font-family: 'VT323', monospace;
  font-size: 0.85rem;
  color: #b71c1c;
  background: rgba(252,228,236,0.8);
  padding: 0.2rem 0.5rem;
  box-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.changes-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.change-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.9rem;
  flex-wrap: wrap;
}

.change-original {
  font-family: 'Special Elite', monospace;
  color: #b71c1c;
  text-decoration: line-through;
  opacity: 0.8;
}

.arrow {
  color: #4a4a4a;
  font-weight: bold;
}

.change-new {
  font-family: 'Special Elite', monospace;
  color: #2e7d32;
  font-weight: bold;
}

.compliance-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(232,245,233,0.7);
  border: 1px solid #81c784;
  font-family: 'VT323', monospace;
  font-size: 0.95rem;
  color: #2e7d32;
  letter-spacing: 0.1em;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}

.notice-icon {
  font-size: 1.25rem;
}
</style>
