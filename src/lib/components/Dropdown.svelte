<script lang="ts" context="module">
	const isOptionObject = (option: DropdownOption): option is DropdownOptionAsObject => {
		if ((option as any).label) return true;
		return false;
	};
</script>

<script lang="ts">
	import type { DropdownOption, DropdownOptionAsObject } from '../types/dropdown';
	import getElementCoordsAndSizes from '$lib/utils/getElementCoordsAndSizes';
	import clickOutsideElement from '$lib/utils/svelte-actions/clickOutsideElement';
	import { onMount, tick } from 'svelte';
	import Backdrop from './Backdrop.svelte';
	import Icon from './Icon.svelte';

	export let onSelect: (opt: DropdownOption) => any = () => {};
	export let options: DropdownOption[] = [];
	export let visible = false;
	$: visibleState = visible;
	let dropdownContainerRef: HTMLElement;
	let coord: any = {};

	$: onDropdownLabelClick = async () => {
		const newElementStats = getElementCoordsAndSizes(dropdownContainerRef);
		if (
			newElementStats &&
			(coord.top !== newElementStats.top || coord.left !== newElementStats.left)
		) {
			coord = newElementStats;
			await tick();
		}
		visibleState = !visibleState;
		// await tick();
	};

	onMount(() => {
		coord = getElementCoordsAndSizes(dropdownContainerRef);
	});

	const hideOptions = (e: MouseEvent) => {
		visibleState = false;
	};

	// $: changeDropdownVisibility = () => {
	// 	// console.log('visible', visible);
	// 	visibleState = !visibleState;
	// };

	const arrowSize = '5px';
</script>

<div
	class="flex custom-dropdown h-full cursor-pointer hover:opacity-80 transition-opacity duration-100"
>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="w-full h-full flex" on:click={onDropdownLabelClick} bind:this={dropdownContainerRef}>
		<div><slot /></div>
		<Icon
			class="transition-transform duration-100 ml-1 {visibleState ? 'rotate-180' : ''} text-white"
			name="keyboard_arrow_down"
		/>
	</div>
	<Backdrop backdropVisible={false} duration={150} visible={visibleState}>
		<div
			use:clickOutsideElement
			on:outclick={hideOptions}
			class="dropdown-options-container {visibleState
				? 'opacity-100 scale-y-100'
				: 'opacity-0 scale-y-0'}"
			style="top: {coord.top + coord.height + 10}px;left: {coord.left}px; width: {coord.width}px"
		>
			{#each options as option, index (isOptionObject(option) ? option.label : option)}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					class:border-b={index === options.length - 1}
					style={`--arrowSize: ${arrowSize}`}
					class="dropdown-option"
					on:click={() => {
						if (isOptionObject(option) && option.label) {
							option?.onSelect?.(option);
						}
						onSelect(option);
					}}
				>
					{isOptionObject(option) && option.label ? option.label : option}
				</div>
			{/each}
		</div>
	</Backdrop>
</div>

<style lang="scss">
	.dropdown-options-container {
		@apply flex flex-col justify-start items-stretch;
		@apply absolute left-0 h-auto w-full z-50 origin-top-left;
		@apply transition-[opacity,transform] duration-150;
		& .dropdown-option {
			@apply p-2 cursor-pointer;
			@apply border-t border-l border-r border-placeholder;
			@apply bg-white  hover:bg-btn-primary;
			@apply hover:text-white;

			&:first-of-type {
				transition: none;
				&::before {
					position: absolute;
					transition: none;
					top: -1px;
					left: 50%;
					transform: translate(-50%, -50%) rotate(45deg);
					width: 10px;
					height: 10px;
					background-color: inherit;
					border: inherit;
					border-bottom: none;
					border-right: none;
					content: '';
				}
			}
		}
	}
</style>
