<script lang="ts">
	import { ButtonTypes } from '$lib/constants/buttonTypes';
	import type { GeneralFunction } from '$lib/types/common';
	import type { SvelteComponent } from 'svelte';
	import Button from './Button.svelte';
	export let items: { label: string; key?: string; component: typeof SvelteComponent }[] = [];
	export let activeKey = '0';
	export let headerClassName = '';
	export let contentClassName = '';
	export let onTabChange: ((v: string) => void) | undefined = undefined;
	let classname = '';
	export { classname as class };
	$: isActive = (key: string | number) => activeKey === `${key}`;
	const handleClick = (tabValue: string | number) => () => {
		activeKey = `${tabValue}`;
		onTabChange?.(`${tabValue}`);
	};
	let tabHeaderRef: HTMLElement;
	let indicatorBarParams: { width: number; left: number } = { width: 0, left: 0 };
	$: {
		if (tabHeaderRef) {
			const activeElem = tabHeaderRef.querySelector(`[data-tab-key="${activeKey}"]`);
			if (activeElem) {
				indicatorBarParams = {
					width: activeElem.getBoundingClientRect().width,
					left: activeElem.offsetLeft
				};
			}
		}
	}
	$: {
	}
</script>

<div class="tab {classname}">
	<div
		class="tab-header {headerClassName}"
		bind:this={tabHeaderRef}
		style="--indicatorBarLeft:{indicatorBarParams?.left}px;--indicatorBarWidth:{indicatorBarParams?.width}px"
	>
		{#each items as { key, label }, index (key || index)}
			<div data-tab-key={key || index} class="tab-header-btn" class:active={isActive(key || index)}>
				<Button
					class="px-8	 py-3 !text-sm hover:opacity-100 {isActive(key || index)
						? 'text-main-blue'
						: ''}"
					buttonType={ButtonTypes.TEXT_ONLY}
					on:click={handleClick(key || index)}
				>
					{label}
				</Button>
			</div>
		{/each}
	</div>
	{#each items as { key, label, component }, index (key || index)}
		{#if isActive(key || index)}
			<div class="{contentClassName} flex-1 overflow-auto">
				<svelte:component this={component} />
			</div>
		{/if}
	{/each}
</div>

<style lang="scss">
	.tab {
		@apply flex flex-col overflow-hidden max-h-full;
	}
	.tab-header {
		@apply flex;
		&::before {
			@apply transition-all duration-75 absolute bottom-0 border h-[1px] rounded-sm border-main-blue;
			left: var(--indicatorBarLeft);
			width: var(--indicatorBarWidth);
			content: '';
		}
	}
	/* .box {
		margin-bottom: 10px;
		padding: 40px;
		border: 1px solid #dee2e6;
		border-radius: 0 0 0.5rem 0.5rem;
		border-top: 0;
	}
	ul {
		display: flex;
		flex-wrap: wrap;
		padding-left: 0;
		margin-bottom: 0;
		list-style: none;
		border-bottom: 1px solid #dee2e6;
	}
	li {
		margin-bottom: -1px;
	}

	span {
		border: 1px solid transparent;
		border-top-left-radius: 0.25rem;
		border-top-right-radius: 0.25rem;
		display: block;
		padding: 0.5rem 1rem;
		cursor: pointer;
	}

	span:hover {
		border-color: #e9ecef #e9ecef #dee2e6;
	}

	li.active > span {
		color: #495057;
		background-color: #fff;
		border-color: #dee2e6 #dee2e6 #fff;
	} */
</style>
