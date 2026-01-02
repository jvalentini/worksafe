<script lang="ts">
import { appState } from "$lib/state.svelte";

function _handleKeyDown(e: KeyboardEvent) {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    appState.processText(appState.textInput);
  }
}

async function _handleTransform() {
  await appState.processText(appState.textInput);
}
</script>

<div class="input-panel" class:visible={appState.inputMode === 'text'}>
	<div class="panel-header">
		<span class="panel-number">02</span>
		<span class="panel-label">RAW INPUT FORM</span>
		<span class="panel-status">REQUIRED FIELD</span>
	</div>
	
	<textarea
		id="text-input"
		bind:value={appState.textInput}
		onkeydown={handleKeyDown}
		placeholder="ENTER UNPROFESSIONAL TEXT HERE...&#10;&#10;Example: This is bullshit. Why can't you idiots figure this out?"
		rows="8"
	></textarea>
	
	<div class="button-row">
		<button 
			class="transform-btn"
			onclick={handleTransform}
			disabled={!appState.textInput.trim() || appState.isProcessing}
		>
			{#if appState.isProcessing}
				<span class="spinner"></span> PROCESSING...
			{:else}
				▶ GENERATE PROFESSIONAL TEXT
			{/if}
		</button>
		<span class="shortcut-hint">CTRL+ENTER</span>
	</div>
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
		color: #8a4a4a;
		background: #f5e6e6;
		padding: 0.125rem 0.5rem;
		border: 1px solid #8a4a4a;
	}

	textarea {
		width: 100%;
		padding: 1rem;
		background: #fff;
		border: 2px solid #c9b896;
		color: #1a1a1a;
		font-family: 'Courier New', monospace;
		font-size: 0.875rem;
		resize: vertical;
		transition: border-color 0.2s;
	}

	textarea:focus {
		outline: none;
		border-color: #c9b896;
		box-shadow: inset 0 0 0 2px rgba(201, 184, 150, 0.2);
	}

	textarea::placeholder {
		color: #8a8a8a;
	}

	.button-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: 1rem;
	}

	.transform-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: #2a2a2a;
		color: #d4c5a9;
		border: 2px solid #5a5a5a;
		font-family: 'Courier New', monospace;
		font-size: 0.75rem;
		font-weight: bold;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.transform-btn:hover:not(:disabled) {
		background: #3d3d3d;
		border-color: #c9b896;
		color: #d4c5a9;
	}

	.transform-btn:disabled {
		background: #4a4a4a;
		color: #6a6a6a;
		cursor: not-allowed;
	}

	.spinner {
		width: 12px;
		height: 12px;
		border: 2px solid #c9b896;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.shortcut-hint {
		font-family: 'Courier New', monospace;
		font-size: 0.625rem;
		color: #6a6a6a;
		background: #e0dcc8;
		padding: 0.25rem 0.5rem;
		border: 1px dashed #5a5a5a;
	}
</style>
