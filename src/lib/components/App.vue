<template>
  <div class="app-container">
    <TPSHeader />

    <main class="main-content">
      <!-- Scattered Flair Pins -->
      <div class="flair-pins-scattered">
        <FlairBadge 
          emoji="☕" 
          color="orange" 
          title="I need my coffee"
          class="flair-scattered flair-1"
        />
        <FlairBadge 
          emoji="📋" 
          color="blue" 
          title="TPS Reports"
          class="flair-scattered flair-2"
        />
        <FlairBadge 
          emoji="💼" 
          color="purple" 
          title="Case of the Mondays"
          class="flair-scattered flair-4"
        />
        <FlairBadge 
          emoji="🖨️" 
          color="green" 
          title="PC LOAD LETTER"
          class="flair-scattered flair-5"
        />
        <FlairBadge 
          emoji="⭐" 
          color="yellow" 
          title="15 pieces of flair!"
          class="flair-scattered flair-6"
        />
      </div>

      <div class="input-section">
        <PostItNote color="yellow" :rotate="-2">
          <strong>📝 INPUT</strong><br/>
          Speak or type your raw text
        </PostItNote>

        <VoiceInput @switch-mode="setInputMode" />
        <TextInput @switch-mode="setInputMode" />
      </div>

      <SettingsPanel />

      <div class="output-section">
        <PostItNote color="green" :rotate="1">
          <strong>✅ OUTPUT</strong><br/>
          Professional & TPS compliant
        </PostItNote>

        <OutputPanel />
      </div>
    </main>

    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-left">
          <span class="footer-badge">◉ INTERNAL USE ONLY</span>
          <span class="footer-divider">|</span>
          <span class="footer-text">AUTHORIZED PERSONNEL ONLY</span>
        </div>
        <div class="footer-right">
          <span class="footer-text">ALL PROCESSING LOGGED</span>
          <span class="footer-divider">|</span>
          <span class="footer-badge tps">TPS REPORT COMPLIANT</span>
        </div>
      </div>
      <div class="coffee-stain"></div>
    </footer>

    <!-- AI Processing Indicator -->
    <ProcessingBadge />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { initApp, inputMode } from "$lib/state";
import TPSHeader from "./TPSHeader.vue";
import FlairBadge from "./FlairBadge.vue";
import PostItNote from "./PostItNote.vue";
import VoiceInput from "./VoiceInput.vue";
import TextInput from "./TextInput.vue";
import SettingsPanel from "./SettingsPanel.vue";
import OutputPanel from "./OutputPanel.vue";
import ProcessingBadge from "./ProcessingBadge.vue";

function setInputMode(mode: "voice" | "text") {
  inputMode.value = mode;
}

onMounted(() => {
  initApp();
});
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-left: 50px;
  padding-right: 50px;
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  position: relative;
}

.flair-pins-scattered {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.flair-scattered {
  position: absolute;
  pointer-events: auto;
}

/* Scattered positioning - mimicking random flair pin placement */
.flair-1 {
  top: 80px;
  left: -80px;
  transform: rotate(-15deg);
}

.flair-2 {
  top: 280px;
  right: -70px;
  transform: rotate(22deg);
}

.flair-3 {
  top: 180px;
  left: -90px;
  transform: rotate(8deg);
}

.flair-4 {
  top: 520px;
  right: -85px;
  transform: rotate(-18deg);
}

.flair-5 {
  top: 420px;
  left: -75px;
  transform: rotate(12deg);
}

.flair-6 {
  top: 720px;
  right: -80px;
  transform: rotate(-25deg);
}

.input-section {
  margin-bottom: 1.5rem;
}

.input-section > :deep(.postit) {
  margin-bottom: 1rem;
  display: inline-block;
}



.output-section {
  margin-top: 2rem;
}

.output-section > :deep(.postit) {
  margin-bottom: 1rem;
  display: inline-block;
}

.app-footer {
  background: linear-gradient(180deg, #3d3d3d 0%, #2a2a2a 100%);
  border-top: 4px solid #5a5a5a;
  padding: 1rem 2rem;
  position: relative;
  margin-left: -50px;
  margin-right: -50px;
  padding-left: calc(50px + 2rem);
  padding-right: calc(50px + 2rem);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  max-width: 900px;
  margin: 0 auto;
}

.footer-left,
.footer-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.footer-badge {
  font-family: 'VT323', monospace;
  font-size: 0.75rem;
  color: #ff6b6b;
  letter-spacing: 0.15em;
}

.footer-badge.tps {
  color: #00ff41;
}

.footer-divider {
  color: #5a5a5a;
}

.footer-text {
  font-family: 'VT323', monospace;
  font-size: 0.7rem;
  color: #7a7a7a;
  letter-spacing: 0.1em;
}

.coffee-stain {
  position: absolute;
  bottom: 10px;
  right: 80px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at center,
    transparent 25%,
    rgba(139, 90, 43, 0.06) 30%,
    rgba(139, 90, 43, 0.1) 40%,
    rgba(139, 90, 43, 0.04) 55%,
    transparent 65%
  );
  pointer-events: none;
}

@media (max-width: 768px) {
  .app-container {
    padding-left: 25px;
    padding-right: 25px;
  }

  .app-footer {
    margin-left: -25px;
    margin-right: -25px;
    padding-left: calc(25px + 1rem);
    padding-right: calc(25px + 1rem);
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }

  .footer-left,
  .footer-right {
    justify-content: center;
  }

  /* Hide flair pins on mobile to avoid overflow */
  .flair-pins-scattered {
    display: none;
  }
}
</style>
