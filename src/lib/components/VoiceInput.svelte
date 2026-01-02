<script lang="ts">
import { appState } from "$lib/state.svelte";

let canvas: HTMLCanvasElement;
let animationId: number;

function drawWaveform() {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Office fluorescent lighting gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#f5f0e6");
  gradient.addColorStop(0.5, "#e8e0d0");
  gradient.addColorStop(1, "#d4c5a9");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  if (appState.isRecording) {
    // Animated waveform
    const time = Date.now() / 200;
    ctx.strokeStyle = "#8a4a4a";
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = 0; x < width; x += 2) {
      const y =
        height / 2 + Math.sin(x * 0.02 + time) * 20 * Math.sin(time * 0.5);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Scan lines effect
    ctx.fillStyle = "rgba(0, 0, 0, 0.03)";
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y, width, 1);
    }
  }
}

$effect(() => {
  const animate = () => {
    drawWaveform();
    animationId = requestAnimationFrame(animate);
  };
  animate();

  return () => {
    if (animationId) cancelAnimationFrame(animationId);
  };
});
</script>

<div class="input-panel" class:visible={appState.inputMode === 'voice'}>
	<div class="panel-header">
		<span class="panel-number">01</span>
		<span class="panel-label">VOICE INPUT TERMINAL</span>
		<span class="panel-status" class:active={appState.isRecording}>
			{appState.isRecording ? '• RECORDING' : '• STANDBY'}
		</span>
	</div>

	<div class="waveform-container">
		<canvas bind:this={canvas} width="400" height="80"></canvas>
	</div>

	<button 
		class="record-btn"
		class:recording={appState.isRecording}
		onclick={() => appState.toggleRecording()}
	>
		<div class="record-indicator"></div>
		<span class="record-text">
			{appState.isRecording ? 'END SESSION (CLICK)' : 'INITIATE VOICE SESSION'}
		</span>
	</button>

	<div class="status-bar">
		<span class="status-label">SYSTEM STATUS:</span>
		<span class="status-value">{appState.voiceStatus}</span>
	</div>

	{#if appState.liveTranscript}
		<div class="transcript-box">
			<div class="transcript-header">
				<span>LIVE TRANSCRIPT</span>
				<span class="transcript-time">{new Date().toLocaleTimeString()}</span>
			</div>
			<p class="transcript-text">{appState.liveTranscript}</p>
		</div>
	{/if}
</div>

<style>
	.input-panel {
		display: none;
		background: #f5f0e6;
		border: 2px solid #5a5a5a;
		border-top: none;
		padding: 1rem;
	}

	.input-panel.visible {
		display: block;
	}

	.panel-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px dashed #c9b896;
	}

	.panel-number {
		font-family: 'Courier New', monospace;
		font-size: 0.75rem;
		font-weight: bold;
		color: #c9b896;
		background: #1a1a1a;
		padding: 0.25rem 0.5rem;
	}

	.panel-label {
		font-family: 'Arial', sans-serif;
		font-size: 0.75rem;
		font-weight: bold;
		letter-spacing: 0.1em;
		color: #5a5a5a;
		flex: 1;
	}

	.panel-status {
		font-family: 'Courier New', monospace;
		font-size: 0.625rem;
		color: #4a7c4a;
		background: #e6f5e6;
		padding: 0.125rem 0.5rem;
		border: 1px solid #4a7c4a;
	}

	.panel-status.active {
		color: #8a4a4a;
		background: #f5e6e6;
		border-color: #8a4a4a;
		animation: pulse-status 1s infinite;
	}

	@keyframes pulse-status {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.6; }
	}

	.waveform-container {
		background: #e8e0d0;
		border: 1px solid #c9b896;
		margin-bottom: 1rem;
	}

	canvas {
		display: block;
		width: 100%;
		height: 80px;
	}

	.record-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		max-width: 200px;
		margin: 1rem auto;
		padding: 1.5rem;
		background: #2a2a2a;
		border: 3px solid #5a5a5a;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.record-btn:hover {
		border-color: #c9b896;
		background: #3d3d3d;
	}

	.record-btn.recording {
		border-color: #8a4a4a;
		background: #3d2a2a;
	}

	.record-indicator {
		width: 24px;
		height: 24px;
		background: #8a4a4a;
		border-radius: 50%;
		margin-bottom: 0.75rem;
		transition: all 0.2s;
	}

	.record-btn.recording .record-indicator {
		background: #c9b896;
		animation: record-pulse 1.5s infinite;
	}

	@keyframes record-pulse {
		0%, 100% {
			box-shadow: 0 0 0 0 rgba(201, 184, 150, 0.6);
			transform: scale(1);
		}
		50% {
			box-shadow: 0 0 0 15px rgba(201, 184, 150, 0);
			transform: scale(1.1);
		}
	}

	.record-text {
		font-family: 'Courier New', monospace;
		font-size: 0.7rem;
		font-weight: bold;
		letter-spacing: 0.1em;
		color: #c9b896;
		text-transform: uppercase;
	}

	.status-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background: #1a1a1a;
		border: 1px solid #5a5a5a;
		font-family: 'Courier New', monospace;
		font-size: 0.625rem;
	}

	.status-label {
		color: #6a6a6a;
		text-transform: uppercase;
	}

	.status-value {
		color: #c9b896;
		animation: blink-text 1s infinite;
	}

	@keyframes blink-text {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.7; }
	}

	.transcript-box {
		margin-top: 1rem;
		background: #e8e0d0;
		border: 1px dashed #5a5a5a;
		padding: 0.75rem;
	}

	.transcript-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
		font-family: 'Courier New', monospace;
		font-size: 0.625rem;
		color: #5a5a5a;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.transcript-time {
		color: #8a8a8a;
	}

	.transcript-text {
		font-family: 'Georgia', serif;
		font-size: 0.875rem;
		color: #1a1a1a;
		font-style: italic;
		margin: 0;
		line-height: 1.6;
	}
</style>
