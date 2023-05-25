<script lang="ts">
	import Popover from '$lib/components/Popover.svelte';
	import type { ElementClickEventHandler, InputChangeEventHandler } from '$lib/types/events';
	import type {
		InputComponentChangeHandler,
		InputPropsForInputComponents
	} from '$lib/types/input-component';
	import getElementCoordsAndSizes from '$lib/utils/getElementCoordsAndSizes';
	import clickOutsideElement from '$lib/utils/svelte-actions/clickOutsideElement';
	import { createEventDispatcher } from 'svelte';

	// type $$Props = InputPropsForInputComponents;
	export let textSuggestion: string[] = [];
	export let value: string | undefined = undefined;
	export let label: string | undefined = '';
	let className: string | undefined = undefined;
	export { className as class };
	export let onChange: InputComponentChangeHandler | undefined = undefined;
	export let name = '';
	let suggestionVisible = false;
	const onInputChange: InputChangeEventHandler = (e) => {
		onChange?.(e.currentTarget.value, e);
	};
	const dispatch = createEventDispatcher();
	const onFocus = (e: FocusEvent) => {
		changeOptionVisible();
		dispatch('focus', e);
	};
	let optionContainerRef: HTMLElement;
	$: changeOptionVisible = () => {
		suggestionVisible = !suggestionVisible;
	};
	$: onSelectOptionClick = (v: string) => {
		onChange?.(v);
		suggestionVisible = !suggestionVisible;
	};
</script>

<!-- <input
	on:focusout
	on:focus={onFocus}
	on:blur
	data-input-focusable
	placeholder={label}
	{name}
	{value}
	on:input={onInputChange}
	class={className}
/> -->
<Popover
	popoverArrowVisible={false}
	bind:visible={suggestionVisible}
	backdropVisible={false}
	destroyOnClose={true}
	behaviour="click"
	position="bottom"
>
	<div class="w-full flex" bind:this={optionContainerRef}>
		<input
			autocomplete={textSuggestion.length ? 'off' : 'auto'}
			on:focusout
			on:focus={onFocus}
			on:blur
			data-input-focusable
			placeholder={label}
			{name}
			{value}
			on:input={onInputChange}
			class={className}
		/>
	</div>
	<svelte:fragment slot="popoverContent">
		{#if textSuggestion.length}
			<div
				class="input-options-container"
				style="min-width:{optionContainerRef
					? getElementCoordsAndSizes(optionContainerRef).width
					: '150'}px"
				use:clickOutsideElement
				on:outclick={(e) => {
					if (!optionContainerRef?.contains(e.detail.event.target)) changeOptionVisible();
				}}
			>
				{#each textSuggestion as option (option)}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div
						class="p-2 cursor-pointer flex items-center hover:bg-gray-300"
						on:click={() => {
							onSelectOptionClick(option);
						}}
					>
						<!-- {#if optionComponent}
							<svelte:component
								this={optionComponent.component}
								{option}
								{...optionComponent.props || {}}
							/>
						{:else} -->
						<span>{option}</span>
						<!-- {/if} -->
					</div>
				{/each}
			</div>
		{/if}
	</svelte:fragment>
</Popover>

<style lang="scss">
	.input-substitution {
		& > .placeholder-substitution {
			@apply text-placeholder;
		}
	}
	.input-options-container {
		@apply bg-white z-50 rounded-sm border border-gray-300 max-h-[400px] overflow-auto;
		// @apply transition-all duration-100;
		box-shadow: 0 4px 5px -5px lightgrey;
	}
</style>
