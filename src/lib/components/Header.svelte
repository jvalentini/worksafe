<script lang="ts">
import { appState } from "$lib/state.svelte";

const { children } = $props();
</script>

<header class="header">
	<div class="header-content">
		<div class="logo-row">
			<span class="logo-icon">◼</span>
			<h1 class="logo">WorkSafe™</h1>
		</div>
		<p class="tagline">INTERNAL USE ONLY • TPS REPORT GENERATOR</p>
	</div>
	<div class="header-meta">
		<span class="dept">DEPartment of Corporate COMMUNICATIONS</span>
		<span class="id-badge">ID: WS-001</span>
	</div>
</header>

<style>
	.header {
		background: linear-gradient(180deg, #3d3d3d 0%, #2a2a2a 100%);
		border: 2px solid #5a5a5a;
		border-bottom: none;
		padding: 1.5rem;
		position: relative;
	}

	.header::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: #c9b896;
	}

	.header-content {
		text-align: center;
		margin-bottom: 1rem;
	}

	.logo-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.logo-icon {
		font-size: 1.5rem;
		color: #c9b896;
		animation: blink 3s infinite;
	}

	@keyframes blink {
		0%, 95%, 100% { opacity: 1; }
		97% { opacity: 0.3; }
	}

	.logo {
		font-family: 'Arial Black', 'Helvetica Neue', sans-serif;
		font-size: 2.5rem;
		font-weight: 900;
		letter-spacing: -0.02em;
		color: #d4c5a9;
		text-shadow: 2px 2px 0 #1a1a1a;
		margin: 0;
	}

	.tagline {
		font-family: 'Courier New', monospace;
		font-size: 0.65rem;
		letter-spacing: 0.2em;
		color: #6a6a6a;
		text-transform: uppercase;
		margin: 0;
	}

	.header-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 1rem;
		border-top: 1px dashed #5a5a5a;
	}

	.dept {
		font-family: 'Courier New', monospace;
		font-size: 0.625rem;
		color: #5a5a5a;
		letter-spacing: 0.1em;
	}

	.id-badge {
		font-family: 'Courier New', monospace;
		font-size: 0.625rem;
		color: #8a8a8a;
		background: #1a1a1a;
		padding: 0.25rem 0.5rem;
		border: 1px solid #5a5a5a;
	}
</style>
