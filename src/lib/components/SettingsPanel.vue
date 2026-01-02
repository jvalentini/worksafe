<template>
  <section class="settings-section">
    <div class="settings-row">
      <div class="mode-control">
        <span class="control-label">PROCESSING MODE:</span>
        <label class="toggle-switch">
          <input 
            type="checkbox" 
            :checked="aiMode"
            @change="toggleAiMode"
          />
          <span class="toggle-track">
            <span class="toggle-thumb"></span>
          </span>
          <span class="toggle-label">
            {{ aiMode ? 'AI ENHANCED' : 'DICTIONARY ONLY' }}
          </span>
        </label>
        <span class="mode-badge" :class="{ ai: aiMode }">
          {{ aiMode ? '◉ ONLINE' : '○ LOCAL' }}
        </span>
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
import { aiMode, saveApiKey } from "$lib/state";

const apiKeyInput = ref("");

function _toggleAiMode() {
  aiMode.value = !aiMode.value;
}

function _handleSaveKey() {
  if (apiKeyInput.value.trim()) {
    saveApiKey(apiKeyInput.value.trim());
    apiKeyInput.value = "";
  }
}
</script>

<style scoped>
.settings-section {
  background: #e8e4d9;
  border: 2px solid #4a4a4a;
  border-top: none;
  padding: 1rem 1.5rem;
}

.settings-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.mode-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.control-label {
  font-family: 'VT323', monospace;
  font-size: 0.9rem;
  color: #4a4a4a;
  letter-spacing: 0.1em;
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.toggle-switch input {
  display: none;
}

.toggle-track {
  width: 52px;
  height: 26px;
  background: #7a7a7a;
  border-radius: 2px;
  position: relative;
  transition: background 0.2s;
  border: 2px solid #4a4a4a;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: #c9b896;
  transition: all 0.2s;
}

.toggle-switch input:checked + .toggle-track {
  background: #2e7d32;
}

.toggle-switch input:checked + .toggle-track .toggle-thumb {
  left: 28px;
  background: #81c784;
}

.toggle-label {
  font-family: 'VT323', monospace;
  font-size: 0.85rem;
  color: #4a4a4a;
  min-width: 120px;
}

.mode-badge {
  font-family: 'VT323', monospace;
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
  background: #e0e0e0;
  color: #6a6a6a;
  border: 1px solid #a8a8a8;
}

.mode-badge.ai {
  background: #2e7d32;
  color: #c8e6c9;
  border-color: #1b5e20;
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
  .settings-row {
    flex-direction: column;
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
