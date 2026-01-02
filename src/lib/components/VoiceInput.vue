<template>
  <div class="voice-panel" v-show="inputMode === 'voice'">
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
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { toggleRecording as doToggleRecording, isRecording } from "$lib/state";

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
  background: #f5f0e6;
  border: 2px solid #4a4a4a;
  padding: 1.5rem;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px dashed #c9b896;
}

.panel-id {
  font-family: 'VT323', monospace;
  font-size: 0.9rem;
  background: #1a1a1a;
  color: #00ff41;
  padding: 0.25rem 0.5rem;
}

.panel-title {
  font-family: 'Courier Prime', monospace;
  font-size: 0.85rem;
  font-weight: bold;
  letter-spacing: 0.1em;
  color: #4a4a4a;
  flex: 1;
}

.panel-status {
  font-family: 'VT323', monospace;
  font-size: 0.85rem;
  padding: 0.25rem 0.75rem;
  background: #e6f5e6;
  color: #166534;
  border: 1px solid #166534;
}

.panel-status.recording {
  background: #fce4ec;
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
  max-width: 220px;
  margin: 0 auto 1.5rem;
  padding: 1.25rem;
  background: linear-gradient(180deg, #3d3d3d 0%, #2a2a2a 100%);
  border: 3px solid #5a5a5a;
  cursor: pointer;
  transition: all 0.2s;
}

.record-button:hover {
  border-color: #c9b896;
  background: linear-gradient(180deg, #4a4a4a 0%, #3d3d3d 100%);
}

.record-button.recording {
  border-color: #b71c1c;
  background: linear-gradient(180deg, #4a2a2a 0%, #3d1a1a 100%);
}

.record-light {
  width: 28px;
  height: 28px;
  background: #8b0000;
  border-radius: 50%;
  box-shadow: 0 0 0 3px #4a4a4a;
  transition: all 0.2s;
}

.record-button.recording .record-light {
  background: #ff4444;
  box-shadow: 
    0 0 0 3px #4a4a4a,
    0 0 20px #ff4444;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 3px #4a4a4a, 0 0 20px #ff4444; }
  50% { box-shadow: 0 0 0 3px #4a4a4a, 0 0 40px #ff4444; }
}

.record-text {
  font-family: 'VT323', monospace;
  font-size: 1rem;
  letter-spacing: 0.15em;
  color: #c9b896;
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
  background: #faf8f3;
  border: 1px dashed #4a4a4a;
  padding: 1rem;
}

.transcript-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-family: 'VT323', monospace;
  font-size: 0.8rem;
  color: #6a6a6a;
  letter-spacing: 0.1em;
}

.timestamp {
  color: #a8a8a8;
}

.transcript-text {
  font-family: 'Special Elite', monospace;
  font-size: 1rem;
  color: #1a1a1a;
  font-style: italic;
  margin: 0;
  line-height: 1.6;
}
</style>
