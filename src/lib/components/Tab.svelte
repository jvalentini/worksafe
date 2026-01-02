<script lang="ts">
const { active = false, children, onclick } = $props();
</script>

<button class="tab" class:active {onclick}>
	{@render children()}
</button>

<style>
	.tab {
		flex: 1;
		padding: 0.5rem 1rem;
		background: #4a4a4a;
		border: 1px solid #5a5a5a;
		color: #8a8a8a;
		font-family: 'Courier New', monospace;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.tab:first-child {
		border-right: none;
	}

	.tab:hover {
		background: #3d3d3d;
		color: #c9b896;
		border-color: #6a6a6a;
	}

	.tab.active {
		background: #c9b896;
		color: #1a1a1a;
		border-color: #c9b896;
		font-weight: bold;
	}
</style>
