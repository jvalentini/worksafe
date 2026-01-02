<script lang="ts">
import { appState } from "$lib/state.svelte";

let apiKeyInput = $state("");
let _showApiInput = $state(false);

function _saveApiKey() {
  if (apiKeyInput.trim()) {
    appState.saveApiKey(apiKeyInput.trim());
    _showApiInput = false;
    apiKeyInput = "";
  }
}

function _toggleAiMode() {
  appState.aiMode = !appState.aiMode;
  if (appState.aiMode && !appState.apiKey) {
    _showApiInput = true;
  }
}
</script>

<section class="settings-section">
	<div class="settings-row">
		<div class="mode-toggle-group">
			<span class="toggle-label">PROCESSING MODE:</span>
			<label class="toggle">
				<input 
					type="checkbox" 
					checked={appState.aiMode}
					onchange={toggleAiMode}
				/>
				<span class="toggle-slider"></span>
				<span class="toggle-text">
					{appState.aiMode ? 'AI ENHANCED' : 'DICTIONARY ONLY'}
				</span>
			</label>
			<span class="mode-indicator" class:ai={appState.aiMode}>
				{appState.aiMode ? '◉ CONNECTED' : '○ LOCAL'}
			</span>
		</div>

		<details class="api-settings">
			<summary>▣ API CONFIGURATION</summary>
			<div class="api-form">
				<label>
					<span class="input-label">OPENAI API KEY</span>
					<input 
						type="password" 
						bind:value={apiKeyInput}
						placeholder="sk-..."
					/>
				</label>
				<button class="save-btn" onclick={saveApiKey}>
					{appState.apiKey ? 'UPDATE KEY' : 'SAVE KEY'}
				</button>
			</div>
			{#if appState.apiKey}
				<p class="api-note">✓ Key stored in localStorage</p>
			{/if}
		</details>
	</div>
</section>

<style>
	.settings-section {
		background: #e8e0d0;
		border: 2px solid #5a5a5a;
		border-top: none;
		padding: 1rem;
	}

	.settings-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.mode-toggle-group {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.toggle-label {
		font-family: 'Courier New', monospace;
		font-size: 0.625rem;
		letter-spacing: 0.1em;
		color: #5a5a5a;
		text-transform: uppercase;
	}

	.toggle {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
	}

	.toggle input {
		display: none;
	}

	.toggle-slider {
		width: 48px;
		height: 24px;
		background: #5a5a5a;
		border-radius: 2px;
		position: relative;
		transition: background 0.2s;
	}

	.toggle-slider::after {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: 18px;
		height: 18px;
		background: #8a8a8a;
		transition: all 0.2s;
	}

	.toggle input:checked + .toggle-slider {
		background: #2a5a2a;
	}

	.toggle input:checked + .toggle-slider::after {
		left: 26px;
		background: #8fc88f;
	}

	.toggle-text {
		font-family: 'Courier New', monospace;
		font-size: 0.625rem;
		color: #5a5a5a;
		letter-spacing: 0.05em;
	}

	.mode-indicator {
		font-family: 'Courier New', monospace;
		font-size: 0.625rem;
		padding: 0.25rem 0.5rem;
		background: #e0e0e0;
		color: #5a5a5a;
		border: 1px solid #5a5a5a;
	}

	.mode-indicator.ai {
		background: #2a5a2a;
		color: #8fc88f;
		border-color: #4a7c4a;
	}

	.api-settings {
		background: #f5f0e6;
		border: 1px solid #c9b896;
		padding: 0.5rem 0.75rem;
	}

	.api-settings summary {
		font-family: 'Courier New', monospace;
		font-size: 0.625rem;
		letter-spacing: 0.1em;
		cursor: pointer;
		color: #5a5a5a;
	}

	.api-settings summary:hover {
		color: #8a8a8a;
	}

	.api-form {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.75rem;
		align-items: flex-end;
	}

	.api-form label {
		display: block;
	}

	.input-label {
		display: block;
		font-family: 'Courier New', monospace;
		font-size: 0.5rem;
		color: #6a6a6a;
		margin-bottom: 0.25rem;
		letter-spacing: 0.1em;
	}

	.api-form input {
		padding: 0.5rem;
		background: #fff;
		border: 1px solid #c9b896;
		font-family: 'Courier New', monospace;
		font-size: 0.75rem;
		width: 200px;
	}

	.api-form input:focus {
		outline: none;
		border-color: #c9b896;
	}

	.save-btn {
		padding: 0.5rem 1rem;
		background: #3d3d3d;
		color: #c9b896;
		border: 1px solid #5a5a5a;
		font-family: 'Courier New', monospace;
		font-size: 0.625rem;
		letter-spacing: 0.1em;
		cursor: pointer;
		transition: all 0.15s;
	}

	.save-btn:hover {
		background: #5a5a5a;
		border-color: #c9b896;
	}

	.api-note {
		margin: 0.5rem 0 0;
		font-family: 'Courier New', monospace;
		font-size: 0.5rem;
		color: #4a7c4a;
	}

	@media (max-width: 600px) {
		.settings-row {
			flex-direction: column;
		}
		
		.api-form {
			flex-direction: column;
			align-items: stretch;
		}
		
		.api-form input {
			width: 100%;
		}
	}
</style>
