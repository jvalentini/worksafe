<template>
  <section class="settings-section">
    <div class="flair-toggle-container">
      <label class="ai-flair-toggle" :class="{ active: aiMode }" @click="toggleAiMode">
        <input
          type="checkbox"
          :checked="aiMode"
          @change="toggleAiMode"
          class="sr-only"
        />

        <!-- Lumbergh photo background -->
        <div class="flair-circle" :class="{ active: aiMode }">
          <img
            src="/lundberg.png"
            alt="Bill Lumbergh"
            class="lumbergh-photo"
          />
        </div>

        <!-- Center content -->
        <div class="flair-content">
          <div class="flair-status">{{ aiMode ? 'ACTIVE' : 'OFF' }}</div>
        </div>
      </label>

      <div class="toggle-hint">
        <span class="hint-text">Click to {{ aiMode ? 'disable' : 'enable' }} Lundberg-powered rewriting</span>
      </div>
    </div>

    <div class="settings-row">
      <div class="sarcasm-toggle-container">
        <label class="sarcasm-toggle">
          <input
            type="checkbox"
            :checked="sarcasmMode"
            @change="toggleSarcasmMode"
          />
          <span class="toggle-label">Enable sarcasm detection</span>
        </label>
        <p class="toggle-description">
          Detect and rewrite sarcastic language patterns (dictionary mode only)
        </p>
      </div>

      <details class="api-config">
        <summary>
          <span class="config-icon">⚙️</span>
          API CONFIGURATION
        </summary>
        <div class="config-form">
          <label class="form-field">
            <span class="field-label">OPENAI API KEY</span>
            <input
              type="password"
              v-model="apiKeyInput"
              placeholder="sk-..."
              class="api-input"
            />
          </label>
          <button class="save-btn" @click="handleSaveKey">
            {{ apiKey ? 'UPDATE KEY' : 'SAVE KEY' }}
          </button>
        </div>
        <p v-if="apiKey" class="key-status">
          ✓ API key configured and stored locally
        </p>
      </details>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  aiMode,
  saveApiKey,
  apiKey,
  sarcasmMode,
  saveSarcasmMode,
} from "$lib/state";

const apiKeyInput = ref("");

function toggleAiMode() {
  aiMode.value = !aiMode.value;
}

function toggleSarcasmMode() {
  saveSarcasmMode(!sarcasmMode.value);
}

function handleSaveKey() {
  if (apiKeyInput.value.trim()) {
    saveApiKey(apiKeyInput.value.trim());
    apiKeyInput.value = "";
  }
}
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.settings-section {
  background: transparent;
  border: none;
  padding: 0;
  margin-top: 2rem;
}

.flair-toggle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 1rem;
  margin-bottom: 2rem;
  border-bottom: 3px double #4a4a4a;
  background: linear-gradient(180deg, rgba(0,0,0,0.02) 0%, transparent 100%);
}

.ai-flair-toggle {
  position: relative;
  width: 200px;
  height: 200px;
  cursor: pointer;
  transition: transform 0.3s ease;
  user-select: none;
  margin-bottom: 40px;
}

.ai-flair-toggle:hover {
  transform: scale(1.05) rotate(5deg);
}

.ai-flair-toggle.active:hover {
  transform: scale(1.05) rotate(-5deg);
}

.flair-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #6a6a6a 0%, #4a4a4a 100%);
  padding: 8px;
  box-shadow:
    0 6px 20px rgba(0,0,0,0.4),
    inset 0 2px 4px rgba(255,255,255,0.2),
    inset 0 -2px 4px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
  overflow: hidden;
}

.flair-circle.active {
  background: linear-gradient(135deg, #dc143c 0%, #b71c1c 100%);
  box-shadow:
    0 8px 30px rgba(183,28,28,0.6),
    inset 0 2px 4px rgba(255,255,255,0.3),
    inset 0 -2px 4px rgba(0,0,0,0.4);
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow:
      0 8px 30px rgba(183,28,28,0.6),
      inset 0 2px 4px rgba(255,255,255,0.3),
      inset 0 -2px 4px rgba(0,0,0,0.4);
  }
  50% {
    box-shadow:
      0 12px 40px rgba(183,28,28,0.9),
      inset 0 2px 4px rgba(255,255,255,0.3),
      inset 0 -2px 4px rgba(0,0,0,0.4);
  }
}

.lumbergh-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid #ffffff;
  box-shadow:
    inset 0 2px 6px rgba(0,0,0,0.2),
    0 2px 8px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
}

.flair-circle.active .lumbergh-photo {
  border-color: #fff;
  filter: brightness(1.1);
}



.flair-content {
  position: absolute;
  bottom: -35px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
  pointer-events: none;
}

.flair-status {
  font-family: 'VT323', monospace;
  font-size: 1rem;
  font-weight: bold;
  letter-spacing: 0.2em;
  padding: 0.25rem 0.75rem;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.ai-flair-toggle:not(.active) .flair-status {
  background: #5a5a5a;
  color: #a8a8a8;
  border: 2px solid #4a4a4a;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.ai-flair-toggle.active .flair-status {
  background: linear-gradient(145deg, #dc143c 0%, #b71c1c 100%);
  color: #fff;
  border: 2px solid #8b0000;
  box-shadow:
    0 3px 8px rgba(183,28,28,0.5),
    inset 0 1px 0 rgba(255,255,255,0.3);
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.toggle-hint {
  text-align: center;
}

.hint-text {
  font-family: 'Special Elite', monospace;
  font-size: 0.85rem;
  color: #6a6a6a;
  font-style: italic;
}

.settings-row {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0 1.5rem 1rem;
}

.sarcasm-toggle-container {
  background: #faf8f3;
  border: 1px solid #c9b896;
  padding: 1rem;
  min-width: 250px;
}

.sarcasm-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-family: 'VT323', monospace;
  font-size: 1rem;
  color: #4a4a4a;
}

.sarcasm-toggle input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.toggle-label {
  letter-spacing: 0.05em;
}

.toggle-description {
  margin: 0.5rem 0 0;
  font-family: 'VT323', monospace;
  font-size: 0.75rem;
  color: #6a6a6a;
  font-style: italic;
}

.api-config {
  background: #faf8f3;
  border: 1px solid #c9b896;
  padding: 0.5rem 1rem;
}

.api-config summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'VT323', monospace;
  font-size: 0.85rem;
  color: #4a4a4a;
  cursor: pointer;
  letter-spacing: 0.1em;
}

.api-config summary:hover {
  color: #1a1a1a;
}

.config-icon {
  font-size: 1rem;
}

.config-form {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field-label {
  font-family: 'VT323', monospace;
  font-size: 0.75rem;
  color: #6a6a6a;
  letter-spacing: 0.1em;
}

.api-input {
  padding: 0.5rem 0.75rem;
  font-family: 'VT323', monospace;
  font-size: 1rem;
  background: #fefef9;
  border: 2px solid #a8a8a8;
  width: 200px;
}

.api-input:focus {
  outline: none;
  border-color: #b22222;
}

.save-btn {
  padding: 0.5rem 1rem;
  font-family: 'VT323', monospace;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  background: linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 100%);
  color: #e8e4d9;
  border: 2px solid #3d3d3d;
  box-shadow: 0 2px 0 #2a2a2a;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  top: 0;
}

.save-btn:hover {
  background: linear-gradient(180deg, #6a6a6a 0%, #5a5a5a 100%);
}

.save-btn:active {
  top: 2px;
  box-shadow: 0 0 0 #2a2a2a;
}

.key-status {
  margin: 0.75rem 0 0;
  font-family: 'VT323', monospace;
  font-size: 0.8rem;
  color: #2e7d32;
}

@media (max-width: 600px) {
  .ai-flair-toggle {
    width: 160px;
    height: 160px;
    margin-bottom: 35px;
  }

  .flair-status {
    font-size: 0.9rem;
  }

  .settings-row {
    flex-direction: column;
    padding: 0 1rem 1rem;
  }

  .config-form {
    flex-direction: column;
    align-items: stretch;
  }

  .api-input {
    width: 100%;
  }
}
</style>
