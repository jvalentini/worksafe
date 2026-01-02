<script lang="ts">
let _copied = $state(false);

async function _handleCopy(text: string, e: MouseEvent) {
  const target = e.target as HTMLButtonElement;
  await navigator.clipboard.writeText(text);
  _copied = true;
  target.textContent = "✓ COPIED TO CLIPBOARD";
  setTimeout(() => {
    _copied = false;
    target.textContent = "📋 COPY TO CLIPBOARD";
  }, 2500);
}
</script>

<button
	class="copy-btn"
	class:copied
	onclick={(e) => handleCopy(appState.transformedPlain, e)}
>
	📋 COPY TO CLIPBOARD
</button>

<style>
	.copy-btn {
		width: 100%;
		margin-top: 0.75rem;
		padding: 0.625rem 1rem;
		background: #3d3d3d;
		color: #c9b896;
		border: 2px solid #5a5a5a;
		border-radius: 2px;
		font-family: 'Courier New', monospace;
		font-size: 0.75rem;
		font-weight: bold;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.copy-btn:hover {
		background: #5a5a5a;
		border-color: #c9b896;
		color: #d4c5a9;
	}

	.copy-btn.copied {
		background: #2d5a2d;
		border-color: #4a7c4a;
		color: #8fc88f;
	}
</style>
