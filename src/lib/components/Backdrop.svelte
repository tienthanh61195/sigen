<script lang="ts" context="module">
	let backdropElement: HTMLElement | null = null;
	if (browser) {
		backdropElement = document.getElementById('svelte__backdrop');
	}
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy, onMount, afterUpdate } from 'svelte';
	export let visible: boolean;
	let stateVisible = false;
	export let duration = 150;
	// export let outClickToClose = true;
	export let backdropVisible = true;
	export let destroyOnClose = false;
	let ref: Element;

	$: {
		if (ref && backdropElement) {
			let hasNode = false;
			backdropElement.childNodes.forEach((n) => {
				if (n === ref) hasNode = true;
			});

			if (stateVisible && !hasNode) {
				backdropElement.appendChild(ref);
			}
		}
	}

	afterUpdate(() => {
		stateVisible = visible;
	});

	onMount(() => {
		// if (backdropElement && !destroyOnClose) backdropElement.appendChild(ref);
	});

	onDestroy(() => {
		if (!backdropElement) return;
		let hasNode = false;
		backdropElement?.childNodes.forEach((n) => {
			if (n === ref) hasNode = true;
		});
		if (backdropElement && hasNode) backdropElement.removeChild(ref);
	});
</script>

<div class="portal-clone">
	<div
		class:opacity-0={!stateVisible}
		bind:this={ref}
		class:pointer-events-none={!stateVisible}
		class="custom-overlay duration-{duration}  {backdropVisible && stateVisible
			? 'bg-black bg-opacity-60 z-10 w-screen h-screen'
			: ''}"
	>
		{#if (destroyOnClose && stateVisible) || !destroyOnClose}
			<slot />
		{/if}
	</div>
</div>

<style lang="scss">
	.portal-clone {
		display: none;
	}
	.custom-overlay {
		@apply transition-opacity absolute z-10;
	}
</style>
