<script lang="ts">
import { appState } from "$lib/state.svelte";

function _setInputMode(mode: "voice" | "text") {
  appState.inputMode = mode;
}
</script>

<div class="app-container">
	<Header />

	<main>
		<!-- Input Mode Tabs -->
		<div class="input-tabs">
			<Tab active={appState.inputMode === 'voice'} onclick={() => setInputMode('voice')}>
				◉ VOICE INPUT
			</Tab>
			<Tab active={appState.inputMode === 'text'} onclick={() => setInputMode('text')}>
				◉ TEXT INPUT
			</Tab>
		</div>

		<!-- Input Panels -->
		<div class="input-panels">
			<VoiceInput />
			<TextInput />
		</div>

		<!-- Settings -->
		<Settings />

		<!-- Output -->
		<Output />
	</main>

	<footer>
		<div class="footer-content">
			<span class="footer-label">◉ INTERNAL USE ONLY • AUTHORIZED PERSONNEL ONLY</span>
			<span class="footer-info">ALL PROCESSING LOGGED • TPS REPORT COMPLIANT</span>
		</div>
	</footer>
</div>

<style>
	.app-container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: #d4c5a9;
	}

	main {
		flex: 1;
		width: 100%;
		max-width: 800px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.input-tabs {
		display: flex;
		gap: 0;
		background: #2a2a2a;
		border: 2px solid #5a5a5a;
		border-bottom: none;
	}

	.input-panels {
		margin-bottom: 0;
	}

	footer {
		background: #2a2a2a;
		border: 2px solid #5a5a5a;
		border-top: none;
		padding: 1rem;
		margin-top: 0;
	}

	.footer-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.footer-label {
		font-family: 'Courier New', monospace;
		font-size: 0.5rem;
		color: #5a5a5a;
		letter-spacing: 0.1em;
	}

	.footer-info {
		font-family: 'Courier New', monospace;
		font-size: 0.5rem;
		color: #6a6a6a;
		letter-spacing: 0.05em;
	}

	@media (max-width: 600px) {
		main {
			padding: 0 0.5rem;
		}

		.footer-content {
			flex-direction: column;
			text-align: center;
		}
	}
</style>
