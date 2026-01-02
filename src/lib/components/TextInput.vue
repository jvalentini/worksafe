<template>
  <div class="text-panel" v-show="inputMode === 'text'">
    <div class="panel-header">
      <span class="panel-id">FORM 02</span>
      <span class="panel-title">RAW INPUT DOCUMENT</span>
      <span class="panel-badge">* REQUIRED</span>
    </div>
    
    <div class="form-field">
      <label for="raw-input" class="field-label">ENTER UNPROFESSIONAL TEXT BELOW:</label>
      <textarea
        id="raw-input"
        v-model="textInput"
        @keydown="handleKeyDown"
        placeholder="Type your raw, unfiltered thoughts here...&#10;&#10;Example: This is bullshit. Why can't you idiots figure this out? I'm sick of explaining the same damn thing."
        rows="8"
        class="vintage-textarea"
      ></textarea>
      <div class="field-note">
        <span class="note-icon">📝</span>
        All submissions will be processed according to TPS Report guidelines
      </div>
    </div>
    
    <div class="action-row">
      <button 
        class="submit-btn"
        :class="{ processing: isProcessing }"
        @click="handleTransform"
        :disabled="!textInput.trim() || isProcessing"
      >
        <span v-if="isProcessing" class="spinner"></span>
        <span class="btn-text">
          {{ isProcessing ? 'PROCESSING...' : '▶ GENERATE PROFESSIONAL TEXT' }}
        </span>
      </button>
      <div class="shortcut-badge">
        <kbd>CTRL</kbd>+<kbd>ENTER</kbd>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { processText, textInput, inputMode, isProcessing } from "$lib/state";

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    handleTransform();
  }
}

function handleTransform() {
  processText(textInput.value);
}
</script>

<style scoped>
.text-panel {
  background: linear-gradient(145deg, #fff740 0%, #fff176 60%, #ffee58 100%);
  border: none;
  padding: 1.5rem;
  position: relative;
  box-shadow: 
    3px 4px 8px rgba(0,0,0,0.25),
    -1px -1px 0 rgba(255,255,255,0.5) inset;
  transform: rotate(0.5deg);
}

.text-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: rgba(0,0,0,0.08);
}

.text-panel::after {
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

.panel-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px dashed #d4a700;
}

.panel-id {
  font-family: 'VT323', monospace;
  font-size: 0.9rem;
  background: #5d4037;
  color: #fff740;
  padding: 0.25rem 0.5rem;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.panel-title {
  font-family: 'Courier Prime', monospace;
  font-size: 0.85rem;
  font-weight: bold;
  letter-spacing: 0.1em;
  color: #5d4037;
  flex: 1;
}

.panel-badge {
  font-family: 'VT323', monospace;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  background: rgba(252,228,236,0.8);
  color: #b71c1c;
  border: 1px solid #b71c1c;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.2);
}

.form-field {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  font-family: 'Courier Prime', monospace;
  font-size: 0.75rem;
  font-weight: bold;
  color: #5d4037;
  margin-bottom: 0.5rem;
  letter-spacing: 0.05em;
}

.vintage-textarea {
  width: 100%;
  padding: 1rem;
  font-family: 'VT323', monospace;
  font-size: 1.15rem;
  line-height: 1.5;
  background: rgba(255,255,255,0.4);
  border: 2px solid #d4a700;
  color: #5d4037;
  resize: vertical;
  min-height: 180px;
  box-shadow: 
    inset 3px 3px 6px rgba(0,0,0,0.1),
    inset -1px -1px 0 rgba(255,255,255,0.5);
}

.vintage-textarea:focus {
  outline: none;
  border-color: #b22222;
  box-shadow: 
    inset 3px 3px 6px rgba(0,0,0,0.1),
    0 0 0 3px rgba(178, 34, 34, 0.2);
}

.vintage-textarea::placeholder {
  color: rgba(93,64,55,0.5);
  font-style: italic;
}

.field-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-family: 'Special Elite', monospace;
  font-size: 0.8rem;
  color: #5d4037;
  font-style: italic;
}

.note-icon {
  font-size: 1rem;
}

.action-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.submit-btn {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  font-family: 'VT323', monospace;
  font-size: 1.1rem;
  letter-spacing: 0.1em;
  background: linear-gradient(180deg, #dc143c 0%, #b22222 50%, #8b0000 100%);
  color: white;
  border: 3px solid #8b0000;
  box-shadow: 
    0 4px 0 #5a0000,
    0 6px 10px rgba(0,0,0,0.3);
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  top: 0;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(180deg, #ff1744 0%, #dc143c 50%, #b22222 100%);
}

.submit-btn:active:not(:disabled) {
  top: 4px;
  box-shadow: 
    0 0 0 #5a0000,
    0 2px 5px rgba(0,0,0,0.3);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn.processing {
  background: linear-gradient(180deg, #7a7a7a 0%, #5a5a5a 50%, #4a4a4a 100%);
  border-color: #4a4a4a;
  box-shadow: 0 4px 0 #2a2a2a, 0 6px 10px rgba(0,0,0,0.3);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.shortcut-badge {
  font-family: 'VT323', monospace;
  font-size: 0.85rem;
  color: #5d4037;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.shortcut-badge kbd {
  background: rgba(255,255,255,0.5);
  border: 1px solid #d4a700;
  border-bottom-width: 2px;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: inherit;
  box-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}
</style>
