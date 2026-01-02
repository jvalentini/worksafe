<template>
  <div class="voice-panel" v-show="inputMode === 'voice'">
    <div class="tab-switcher">
      <button 
        class="tab-btn active"
        @click="emit('switch-mode', 'voice')"
      >
        🎤 VOICE INPUT
      </button>
      <button 
        class="tab-btn"
        @click="emit('switch-mode', 'text')"
      >
        <img src="/stapler.png" alt="" class="tab-icon" /> TEXT INPUT
      </button>
    </div>

    <div class="panel-content">
      <div class="panel-header">
        <span class="panel-id">FORM 01</span>
        <span class="panel-title">VOICE INPUT TERMINAL</span>
        <span class="panel-status" :class="{ recording: isRecording }">
          {{ isRecording ? '● REC' : '○ STANDBY' }}
        </span>
      </div>

    <div class="crt-monitor">
      <div class="crt-bezel">
        <canvas ref="waveformCanvas" width="400" height="100"></canvas>
        <div class="crt-reflection"></div>
      </div>
      <div class="monitor-label">INITECH AUDIO SYSTEMS</div>
    </div>

    <button 
      class="record-button"
      :class="{ recording: isRecording }"
      @click="toggleRecording"
    >
      <div class="record-light"></div>
      <span class="record-text">
        {{ isRecording ? '■ END SESSION' : '● START RECORDING' }}
      </span>
    </button>

    <div class="status-display">
      <span class="status-label">STATUS:</span>
      <span class="status-value">{{ voiceStatus }}</span>
      <span class="blink-cursor">_</span>
    </div>

    <div v-if="liveTranscript" class="transcript-box">
      <div class="transcript-header">
        <span>LIVE TRANSCRIPT</span>
        <span class="timestamp">{{ currentTime }}</span>
      </div>
      <p class="transcript-text">{{ liveTranscript }}</p>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { toggleRecording as doToggleRecording, isRecording } from "$lib/state";

const _emit = defineEmits<{
  "switch-mode": [mode: "voice" | "text"];
}>();

const waveformCanvas = ref<HTMLCanvasElement | null>(null);
let animationId: number | null = null;

const _currentTime = computed(() => new Date().toLocaleTimeString());

function drawWaveform() {
  const canvas = waveformCanvas.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#0a1a0a");
  gradient.addColorStop(0.5, "#0d2010");
  gradient.addColorStop(1, "#0a1a0a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(0, 255, 65, 0.3)";
  ctx.lineWidth = 1;
  for (let y = 0; y < height; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  if (isRecording.value) {
    const time = Date.now() / 150;
    ctx.strokeStyle = "#00ff41";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#00ff41";
    ctx.shadowBlur = 10;
    ctx.beginPath();

    for (let x = 0; x < width; x += 2) {
      const amplitude = 25 + Math.sin(time * 0.3) * 10;
      const y =
        height / 2 +
        Math.sin(x * 0.025 + time) * amplitude * Math.sin(time * 0.5) +
        Math.sin(x * 0.05 + time * 1.5) * 8;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else {
    ctx.strokeStyle = "#00aa2a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }
}

function animate() {
  drawWaveform();
  animationId = requestAnimationFrame(animate);
}

function _toggleRecording() {
  doToggleRecording();
}

onMounted(() => {
  animate();
});

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
});
</script>

<style scoped>
.voice-panel {
  background: linear-gradient(145deg, #fff740 0%, #fff176 60%, #ffee58 100%);
  border: none;
  position: relative;
  box-shadow: 
    3px 4px 8px rgba(0,0,0,0.25),
    -1px -1px 0 rgba(255,255,255,0.5) inset;
  transform: rotate(-1deg);
  margin-bottom: 1rem;
}

.voice-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: rgba(0,0,0,0.08);
  z-index: 1;
}

.voice-panel::after {
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

.tab-switcher {
  display: flex;
  gap: 0;
  position: relative;
  z-index: 2;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 1.25rem;
  font-family: 'Special Elite', monospace;
  font-size: 0.95rem;
  font-weight: bold;
  letter-spacing: 0.05em;
  background: rgba(93,64,55,0.15);
  color: rgba(93,64,55,0.6);
  border: none;
  border-bottom: 2px dashed rgba(93,64,55,0.2);
  cursor: pointer;
  transition: all 0.2s;
  text-shadow: 0 1px 0 rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tab-btn:first-child {
  border-right: 1px dashed rgba(93,64,55,0.15);
}

.tab-btn.active {
  background: transparent;
  color: #5d4037;
  border-bottom: none;
  font-size: 1rem;
  padding-bottom: 0.95rem;
}

.tab-btn:not(.active):hover {
  background: rgba(93,64,55,0.1);
  color: rgba(93,64,55,0.8);
}

.tab-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
}

.panel-content {
  padding: 1.5rem;
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

.panel-status {
  font-family: 'VT323', monospace;
  font-size: 0.85rem;
  padding: 0.25rem 0.75rem;
  background: rgba(255,255,255,0.5);
  color: #166534;
  border: 1px solid #166534;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.2);
}

.panel-status.recording {
  background: rgba(255,100,100,0.3);
  color: #b71c1c;
  border-color: #b71c1c;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.crt-monitor {
  margin-bottom: 1.5rem;
}

.crt-bezel {
  position: relative;
  background: #2a2a2a;
  border: 8px solid #3d3d3d;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 
    inset 0 0 30px rgba(0,0,0,0.5),
    0 4px 8px rgba(0,0,0,0.3);
}

.crt-bezel canvas {
  display: block;
  width: 100%;
  height: 100px;
  border-radius: 4px;
}

.crt-reflection {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  height: 40%;
  background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%);
  border-radius: 4px 4px 0 0;
  pointer-events: none;
}

.monitor-label {
  text-align: center;
  font-family: 'VT323', monospace;
  font-size: 0.7rem;
  color: #7a7a7a;
  margin-top: 0.5rem;
  letter-spacing: 0.2em;
}

.record-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 240px;
  margin: 0 auto 1.5rem;
  padding: 1.5rem 1.25rem;
  background: linear-gradient(180deg, #e0e0e0 0%, #b0b0b0 45%, #909090 55%, #707070 100%);
  border: none;
  border-radius: 8px;
  box-shadow: 
    0 8px 0 #4a4a4a,
    0 10px 15px rgba(0,0,0,0.4),
    inset 0 2px 0 rgba(255,255,255,0.7),
    inset 0 -2px 0 rgba(0,0,0,0.3);
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  top: 0;
}

.record-button:hover {
  background: linear-gradient(180deg, #f0f0f0 0%, #c0c0c0 45%, #a0a0a0 55%, #808080 100%);
}

.record-button:active {
  top: 6px;
  box-shadow: 
    0 2px 0 #4a4a4a,
    0 4px 8px rgba(0,0,0,0.3),
    inset 0 2px 0 rgba(255,255,255,0.7),
    inset 0 -2px 0 rgba(0,0,0,0.3);
}

.record-button.recording {
  background: linear-gradient(180deg, #ff6b6b 0%, #e53935 45%, #c62828 55%, #b71c1c 100%);
  box-shadow: 
    0 8px 0 #5a0000,
    0 10px 15px rgba(183,28,28,0.5),
    inset 0 2px 0 rgba(255,255,255,0.4),
    inset 0 -2px 0 rgba(0,0,0,0.4);
}

.record-button.recording:active {
  top: 6px;
  box-shadow: 
    0 2px 0 #5a0000,
    0 4px 8px rgba(183,28,28,0.4),
    inset 0 2px 0 rgba(255,255,255,0.4),
    inset 0 -2px 0 rgba(0,0,0,0.4);
}

.record-light {
  width: 40px;
  height: 40px;
  background: radial-gradient(circle at 30% 30%, #b71c1c 0%, #8b0000 100%);
  border-radius: 50%;
  border: 4px solid #2a2a2a;
  box-shadow: 
    0 3px 6px rgba(0,0,0,0.4),
    inset 0 2px 4px rgba(0,0,0,0.5),
    inset 0 -1px 2px rgba(255,255,255,0.2);
  transition: all 0.2s;
}

.record-button.recording .record-light {
  background: radial-gradient(circle at 30% 30%, #ff6b6b 0%, #ff4444 100%);
  border-color: #1a1a1a;
  box-shadow: 
    0 3px 6px rgba(0,0,0,0.4),
    inset 0 2px 4px rgba(0,0,0,0.3),
    inset 0 -1px 2px rgba(255,255,255,0.4),
    0 0 25px rgba(255,68,68,0.8);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { 
    box-shadow: 
      0 3px 6px rgba(0,0,0,0.4),
      inset 0 2px 4px rgba(0,0,0,0.3),
      inset 0 -1px 2px rgba(255,255,255,0.4),
      0 0 25px rgba(255,68,68,0.8);
  }
  50% { 
    box-shadow: 
      0 3px 6px rgba(0,0,0,0.4),
      inset 0 2px 4px rgba(0,0,0,0.3),
      inset 0 -1px 2px rgba(255,255,255,0.4),
      0 0 40px rgba(255,68,68,1);
  }
}

.record-text {
  font-family: 'VT323', monospace;
  font-size: 1.1rem;
  font-weight: bold;
  letter-spacing: 0.15em;
  color: #2a2a2a;
  text-shadow: 0 1px 0 rgba(255,255,255,0.8);
}

.record-button.recording .record-text {
  color: #ffffff;
  text-shadow: 
    0 1px 2px rgba(0,0,0,0.5),
    0 0 10px rgba(255,255,255,0.5);
}

.status-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #1a1a1a;
  border: 2px solid #4a4a4a;
  font-family: 'VT323', monospace;
  font-size: 0.9rem;
}

.status-label {
  color: #6a6a6a;
}

.status-value {
  color: #00ff41;
  flex: 1;
}

.blink-cursor {
  color: #00ff41;
  animation: cursor-blink 1s infinite;
}

@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.transcript-box {
  margin-top: 1rem;
  background: rgba(255,255,255,0.3);
  border: 1px dashed #d4a700;
  padding: 1rem;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}

.transcript-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-family: 'VT323', monospace;
  font-size: 0.8rem;
  color: #5d4037;
  letter-spacing: 0.1em;
}

.timestamp {
  color: #a8a8a8;
}

.transcript-text {
  font-family: 'Special Elite', monospace;
  font-size: 1rem;
  color: #5d4037;
  font-style: italic;
  margin: 0;
  line-height: 1.6;
}
</style>
