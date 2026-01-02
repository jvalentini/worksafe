<script lang="ts">
import { appState } from "$lib/state.svelte";
import Tab from "./Tab.svelte";
import CopyButton from "./CopyButton.svelte";

let outputMode = $state<"plain" | "email">("plain");

function setOutputMode(mode: "plain" | "email") {
  outputMode = mode;
}
</script>

<section class="output-section">
	<div class="output-header">
		<span class="output-number">03</span>
		<h2>TRANSFORMED OUTPUT</h2>
		<span class="output-badge">READY FOR SUBMISSION</span>
	</div>

	<div class="output-tabs">
		<Tab active={outputMode === 'plain'} onclick={() => setOutputMode('plain')}>
			PLAIN TEXT
		</Tab>
		<Tab active={outputMode === 'email'} onclick={() => setOutputMode('email')}>
			EMAIL FORMAT
		</Tab>
	</div>

	<div class="output-panel" class:visible={outputMode === 'plain'}>
		<div class="output-content" id="output-plain">
			{#if appState.transformedPlain}
				<p>{appState.transformedPlain}</p>
			{:else}
				<span class="placeholder">AWAITING INPUT DATA...</span>
			{/if}
		</div>
		{#if appState.transformedPlain}
			<CopyButton />
		{/if}
	</div>

	<div class="output-panel email" class:visible={outputMode === 'email'}>
		<div class="output-content email-format" id="output-email">
			{#if appState.transformedEmail}
				<p>{appState.transformedEmail}</p>
			{:else}
				<span class="placeholder">AWAITING INPUT DATA...</span>
			{/if}
		</div>
		{#if appState.transformedEmail}
			<CopyButton />
		{/if}
	</div>

	{#if appState.changes.length > 0}
		<div class="changes-summary">
			<div class="changes-header">
				<span>MODIFICATION LOG</span>
				<span class="changes-count">{appState.changes.length} CHANGE(S)</span>
			</div>
			{#each appState.changes as change}
				<div class="change-item">
					<span class="change-original">"{change.original}"</span>
					<span class="arrow">→</span>
					<span class="change-replacement">"{change.replacement}"</span>
				</div>
			{/each}
		</div>
	{:else if appState.transformedPlain}
		<div class="changes-summary">
			<span class="no-changes">NO MODIFICATIONS REQUIRED - TEXT ALREADY COMPLIANT</span>
		</div>
	{/if}
</section>

<style>
	.output-section {
		background: #f5f0e6;
		border: 2px solid #5a5a5a;
		border-top: none;
		padding: 1rem;
	}

	.output-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px dashed #c9b896;
	}

	.output-number {
		font-family: 'Courier New', monospace;
		font-size: 0.75rem;
		font-weight: bold;
		color: #c9b896;
		background: #1a1a1a;
		padding: 0.25rem 0.5rem;
	}

	.output-section h2 {
		font-family: 'Arial', sans-serif;
		font-size: 1rem;
		font-weight: bold;
		letter-spacing: 0.05em;
		color: #5a5a5a;
		margin: 0;
		flex: 1;
	}

	.output-badge {
		font-family: 'Courier New', monospace;
		font-size: 0.5rem;
		color: #4a7c4a;
		background: #e6f5e6;
		padding: 0.125rem 0.5rem;
		border: 1px solid #4a7c4a;
		letter-spacing: 0.1em;
	}

	.output-tabs {
		display: flex;
		gap: 0;
		margin-bottom: 1rem;
	}

	.output-panel {
		display: none;
	}

	.output-panel.visible {
		display: block;
	}

	.output-content {
		padding: 1rem;
		background: #fff;
		border: 2px solid #c9b896;
		min-height: 120px;
		font-family: 'Courier New', monospace;
		font-size: 0.875rem;
		line-height: 1.7;
		color: #1a1a1a;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.output-content .placeholder {
		color: #8a8a8a;
		font-style: italic;
	}

	.output-content.email-format {
		font-family: 'Georgia', serif;
		line-height: 1.9;
	}

	.changes-summary {
		margin-top: 1rem;
		padding: 0.75rem;
		background: #e8e0d0;
		border: 1px dashed #5a5a5a;
	}

	.changes-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
		font-family: 'Courier New', monospace;
		font-size: 0.5rem;
		letter-spacing: 0.1em;
		color: #5a5a5a;
		text-transform: uppercase;
	}

	.changes-count {
		color: #8a4a4a;
	}

	.change-item {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start;
		margin-bottom: 0.5rem;
		font-size: 0.75rem;
		flex-wrap: wrap;
	}

	.change-original {
		color: #8a4a4a;
		text-decoration: line-through;
		font-style: italic;
	}

	.arrow {
		color: #5a5a5a;
	}

	.change-replacement {
		color: #2a5a2a;
		font-weight: bold;
	}

	.no-changes {
		font-family: 'Courier New', monospace;
		font-size: 0.625rem;
		color: #4a7c4a;
	}
</style>
