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
        
        <!-- Star burst background -->
        <svg class="starburst" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="purpleGrad" cx="50%" cy="50%">
              <stop offset="0%" :style="aiMode ? 'stop-color:#9c27b0;stop-opacity:1' : 'stop-color:#6a6a6a;stop-opacity:1'" />
              <stop offset="100%" :style="aiMode ? 'stop-color:#6a1b9a;stop-opacity:1' : 'stop-color:#4a4a4a;stop-opacity:1'" />
            </radialGradient>
          </defs>
          <g transform="translate(100, 100)">
            <!-- 16-point starburst with fat rays and small points -->
            <path v-for="i in 16" :key="i"
              :d="`M 0 -50 L -12 -35 L 0 -58 L 12 -35 Z`"
              :transform="`rotate(${i * 22.5})`"
              fill="url(#purpleGrad)"
              :opacity="aiMode ? 1 : 0.5"
            />
          </g>
          <!-- Center circle -->
          <circle cx="100" cy="100" r="60" 
            :fill="aiMode ? '#8e24aa' : '#5a5a5a'"
            stroke="#2a2a2a" 
            stroke-width="3"
          />
          <circle cx="100" cy="100" r="60" 
            fill="url(#purpleGrad)"
            opacity="0.6"
          />
        </svg>
        
        <!-- Pin backing -->
        <div class="pin-backing"></div>
        
        <!-- Center content -->
        <div class="flair-content">
          <div class="ai-icon">🤖</div>
          <div class="flair-text">AI FLAIR</div>
          <div class="flair-status">{{ aiMode ? 'ACTIVE' : 'OFF' }}</div>
        </div>
      </label>
      
      <div class="toggle-hint">
        <span class="hint-text">Click to {{ aiMode ? 'disable' : 'enable' }} AI-powered rewriting</span>
      </div>
    </div>

    <div class="settings-row">
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
import { aiMode, saveApiKey, apiKey } from "$lib/state";

const apiKeyInput = ref("");

function toggleAiMode() {
  aiMode.value = !aiMode.value;
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
  width: 180px;
  height: 180px;
  cursor: pointer;
  transition: transform 0.3s ease;
  user-select: none;
}

.ai-flair-toggle:hover {
  transform: scale(1.05) rotate(5deg);
}

.ai-flair-toggle.active:hover {
  transform: scale(1.05) rotate(-5deg);
}

.starburst {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
  transition: all 0.3s ease;
}

.ai-flair-toggle.active .starburst {
  filter: drop-shadow(0 6px 20px rgba(142,36,170,0.6));
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% { 
    filter: drop-shadow(0 6px 20px rgba(142,36,170,0.6));
  }
  50% { 
    filter: drop-shadow(0 8px 30px rgba(142,36,170,0.9));
  }
}

.pin-backing {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 25px;
  height: 40px;
  background: linear-gradient(135deg, #c0c0c0 0%, #808080 50%, #606060 100%);
  border-radius: 4px 4px 10px 10px;
  box-shadow: 
    inset 2px 2px 3px rgba(255,255,255,0.5),
    inset -2px -2px 3px rgba(0,0,0,0.3),
    0 6px 12px rgba(0,0,0,0.4);
  z-index: 0;
}

.pin-backing::before {
  content: '';
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 12px;
  background: linear-gradient(180deg, #e0e0e0 0%, #909090 100%);
  border-radius: 2px;
  box-shadow: inset 0 1px 2px rgba(255,255,255,0.8);
}

.flair-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
  pointer-events: none;
}

.ai-icon {
  font-size: 2.5rem;
  margin-bottom: 0.25rem;
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.5));
  transition: transform 0.3s ease;
}

.ai-flair-toggle.active .ai-icon {
  transform: scale(1.1);
  animation: bounce 0.6s ease;
}

@keyframes bounce {
  0%, 100% { transform: scale(1.1); }
  50% { transform: scale(1.2); }
}

.flair-text {
  font-family: 'VT323', monospace;
  font-size: 1.1rem;
  font-weight: bold;
  letter-spacing: 0.15em;
  color: white;
  text-shadow: 
    2px 2px 4px rgba(0,0,0,0.8),
    0 0 10px rgba(255,255,255,0.5);
  margin-bottom: 0.25rem;
}

.flair-status {
  font-family: 'VT323', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.ai-flair-toggle:not(.active) .flair-status {
  background: rgba(0,0,0,0.4);
  color: #c0c0c0;
}

.ai-flair-toggle.active .flair-status {
  background: rgba(255,255,255,0.3);
  color: #fff;
  box-shadow: 0 0 15px rgba(255,255,255,0.5);
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
    width: 150px;
    height: 150px;
  }
  
  .ai-icon {
    font-size: 2rem;
  }
  
  .flair-text {
    font-size: 0.95rem;
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
