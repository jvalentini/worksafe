<template>
  <aside class="settings-sidebar">
    <!-- Mobile drawer toggle -->
    <button class="drawer-toggle" @click="drawerOpen = !drawerOpen">
      <span class="toggle-icon">⚙️</span>
      <span class="toggle-text">SETTINGS</span>
    </button>

    <!-- Settings content -->
    <div class="settings-content" :class="{ open: drawerOpen }">
      <!-- Lumbergh AI Toggle -->
      <div class="control-section">
        <label class="ai-toggle" :class="{ active: aiMode }" @click="toggleAiMode">
          <input
            type="checkbox"
            :checked="aiMode"
            @change="toggleAiMode"
            class="sr-only"
          />

          <div class="toggle-circle" :class="{ active: aiMode }">
            <img
              src="/lumbergh.png"
              alt="Bill Lumbergh"
              class="lumbergh-photo"
            />
          </div>

          <div class="toggle-status">{{ aiMode ? 'ACTIVE' : 'OFF' }}</div>
        </label>

        <p class="control-hint">
          Lumbergh AI {{ aiMode ? 'Enabled' : 'Disabled' }}
        </p>
      </div>

      <!-- Sarcasm Detection -->
      <div class="control-section compact">
        <label class="checkbox-control">
          <input
            type="checkbox"
            :checked="sarcasmMode"
            @change="toggleSarcasmMode"
          />
          <span class="control-label">Sarcasm Detection</span>
        </label>
        <p class="control-hint small">
          Dictionary mode only
        </p>
      </div>

      <!-- API Configuration - only show if AI mode is on -->
      <div v-if="aiMode" class="control-section compact">
        <div class="api-config">
          <label class="form-group">
            <span class="form-label">OPENAI API KEY</span>
            <input
              type="password"
              v-model="apiKeyInput"
              placeholder="sk-..."
              class="form-input"
            />
          </label>
          <button class="save-button" @click="handleSaveKey">
            {{ apiKey ? 'UPDATE' : 'SAVE' }}
          </button>
          <p v-if="apiKey" class="save-status">
            ✓ Key saved
          </p>
        </div>
      </div>
    </div>

    <!-- Close overlay for mobile drawer -->
    <div v-if="drawerOpen" class="drawer-overlay" @click="drawerOpen = false"></div>
  </aside>
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
const drawerOpen = ref(false);

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

.settings-sidebar {
  position: relative;
}

.drawer-toggle {
  display: none;
}

.settings-content {
  background: linear-gradient(145deg, #fff9e6 0%, #fff176 60%, #ffee58 100%);
  border: 2px solid #d4a700;
  padding: 1rem;
  box-shadow: 
    3px 4px 8px rgba(0,0,0,0.25),
    -1px -1px 0 rgba(255,255,255,0.5) inset;
  position: sticky;
  transform: rotate(0.8deg);
  top: 2rem;
}

.control-section {
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px dashed #d4a700;
}

.control-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.control-section.compact {
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
}

/* Lumbergh AI Toggle */
.ai-toggle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.toggle-circle {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6a6a6a 0%, #4a4a4a 100%);
  padding: 6px;
  box-shadow:
    0 4px 12px rgba(0,0,0,0.4),
    inset 0 2px 4px rgba(255,255,255,0.2),
    inset 0 -2px 4px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
}

.toggle-circle.active {
  background: linear-gradient(135deg, #dc143c 0%, #b71c1c 100%);
  box-shadow:
    0 6px 20px rgba(183,28,28,0.6),
    inset 0 2px 4px rgba(255,255,255,0.3),
    inset 0 -2px 4px rgba(0,0,0,0.4);
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow:
      0 6px 20px rgba(183,28,28,0.6),
      inset 0 2px 4px rgba(255,255,255,0.3),
      inset 0 -2px 4px rgba(0,0,0,0.4);
  }
  50% {
    box-shadow:
      0 8px 25px rgba(183,28,28,0.9),
      inset 0 2px 4px rgba(255,255,255,0.3),
      inset 0 -2px 4px rgba(0,0,0,0.4);
  }
}

.lumbergh-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid #ffffff;
  box-shadow:
    inset 0 2px 6px rgba(0,0,0,0.2),
    0 2px 8px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
}

.toggle-circle.active .lumbergh-photo {
  border-color: #fff;
  filter: brightness(1.1);
}

.toggle-status {
  font-family: 'VT323', monospace;
  font-size: 0.9rem;
  font-weight: bold;
  letter-spacing: 0.2em;
  padding: 0.2rem 0.6rem;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.ai-toggle:not(.active) .toggle-status {
  background: #5a5a5a;
  color: #a8a8a8;
  border: 2px solid #4a4a4a;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.ai-toggle.active .toggle-status {
  background: linear-gradient(145deg, #dc143c 0%, #b71c1c 100%);
  color: #fff;
  border: 2px solid #8b0000;
  box-shadow:
    0 2px 6px rgba(183,28,28,0.5),
    inset 0 1px 0 rgba(255,255,255,0.3);
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.control-hint {
  font-family: 'Special Elite', monospace;
  font-size: 0.75rem;
  color: #5d4037;
  text-align: center;
  margin: 0.5rem 0 0;
  font-style: italic;
}

.control-hint.small {
  font-size: 0.65rem;
  margin: 0.25rem 0 0;
}

/* Sarcasm Checkbox */
.checkbox-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-family: 'VT323', monospace;
  font-size: 0.9rem;
  color: #5d4037;
}

.checkbox-control input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.control-label {
  letter-spacing: 0.05em;
}

/* API Configuration */
.api-config {
  background: rgba(255,255,255,0.3);
  border: 1px solid #c9b896;
  padding: 0.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.form-label {
  font-family: 'VT323', monospace;
  font-size: 0.7rem;
  color: #5d4037;
  letter-spacing: 0.1em;
  font-weight: bold;
}

.form-input {
  padding: 0.5rem;
  font-family: 'VT323', monospace;
  font-size: 0.9rem;
  background: #fefef9;
  border: 2px solid #a8a8a8;
  width: 100%;
}

.form-input:focus {
  outline: none;
  border-color: #b22222;
}

.save-button {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-family: 'VT323', monospace;
  font-size: 0.85rem;
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

.save-button:hover {
  background: linear-gradient(180deg, #6a6a6a 0%, #5a5a5a 100%);
}

.save-button:active {
  top: 2px;
  box-shadow: 0 0 0 #2a2a2a;
}

.save-status {
  margin: 0.5rem 0 0;
  font-family: 'VT323', monospace;
  font-size: 0.75rem;
  color: #2e7d32;
  text-align: center;
}

/* Mobile Drawer */
@media (max-width: 900px) {
  .drawer-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem;
    font-family: 'VT323', monospace;
    font-size: 1rem;
    letter-spacing: 0.1em;
    background: linear-gradient(145deg, #fff740 0%, #fff176 60%, #ffee58 100%);
    border: 2px solid #d4a700;
    box-shadow: 0 3px 0 #b38600;
    cursor: pointer;
    transition: all 0.15s;
    position: relative;
    top: 0;
    margin-bottom: 1rem;
    color: #5d4037;
  }

  .drawer-toggle:active {
    top: 3px;
    box-shadow: 0 0 0 #b38600;
  }

  .toggle-icon {
    font-size: 1.2rem;
  }

  .settings-content {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 280px;
    max-width: 85vw;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 1000;
    overflow-y: auto;
    box-shadow: -4px 0 20px rgba(0,0,0,0.4);
  }

  .settings-content.open {
    transform: translateX(0);
  }

  .drawer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 999;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}
</style>
