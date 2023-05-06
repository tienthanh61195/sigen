<script lang="ts">
	import Backdrop from '$lib/components/Backdrop.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Popover from '$lib/components/Popover.svelte';
	import type { GeneralFunction } from '$lib/types/common';
	import type { ElementClickEventHandler, InputChangeEventHandler } from '$lib/types/events';
	import type {
		InputComponentChangeHandler,
		InputOption,
		InputPropsForInputComponents
	} from '$lib/types/input-component';
	import getElementCoordsAndSizes from '$lib/utils/getElementCoordsAndSizes';
	import setBodyClickHandler from '$lib/utils/setBodyClickHandler';
	import clickOutsideElement from '$lib/utils/svelte-actions/clickOutsideElement';
	import { flatten, isEqual } from 'lodash';
	import { createEventDispatcher, onDestroy, onMount, SvelteComponent } from 'svelte';
	import { afterUpdate } from 'svelte/internal';

	// type $$Props = InputPropsForInputComponents;

	export let value: any | undefined = undefined;
	export let disabled = false;
	export let label: string | undefined = '';
	let className: string | undefined = undefined;
	export { className as class };
	export let onChange: InputComponentChangeHandler | undefined = undefined;
	export let name = '';
	export let options: InputOption[] = [];
	export let disableSearch = true;
	export let multiple = false;
	export let allowAddMore = true;
	export let onAddNewOption: GeneralFunction | undefined;
	export let optionComponent:
		| { component: typeof SvelteComponent; props?: Record<string, any> }
		| undefined = undefined;
	let searchValue = '';
	$: filteredOptions = searchValue ? options.filter((o) => o.label.includes(searchValue)) : options;

	let selectedOption: any;
	$: {
		if (!multiple) {
			selectedOption = value ? options?.find((o) => o.value === value) : '';
		} else {
			selectedOption = value ? options?.filter((o) => flatten([value]).includes(o.value)) : [];
		}
	}

	$: {
	}

	let optionVisible = false;
	let coord: any = {};

	$: changeOptionVisible = () => {
		optionVisible = !optionVisible;
	};

	const hideOptions = (e: MouseEvent) => {
		if (!selectContainerRef.contains(e.target)) optionVisible = false;
	};

	const onSelectInputChange: InputChangeEventHandler = (e) => {
		// onChange?.('');
		// selectInputBoxValue = e.currentTarget.value;
	};

	afterUpdate(() => {
		const newCoord = getElementCoordsAndSizes(selectContainerRef);
		if (!isEqual(newCoord, coord)) {
			coord = getElementCoordsAndSizes(selectContainerRef);
		}
	});

	// $: {
	// 	if (multiple && isArray(selectedOption) && selectedOption.length) {
	// 		const newElementStats = getElementCoordsAndSizes(selectContainerRef);
	// 		console.log(newElementStats);

	// 		console.log('wtf', value);
	// 		coord = newElementStats;
	// 	}
	// }

	$: onSelectOptionClick = async ({ value: newOptionValue }: InputOption) => {
		if (disabled) return;
		if (newOptionValue === value && !multiple) return;
		const existingValue = multiple ? value : value ? flatten([value]) : [];
		let newValue: any;
		if (multiple) {
			const alreadySelectedValueIndex = value ? value.indexOf(newOptionValue) : -1;
			if (alreadySelectedValueIndex > -1)
				newValue = [
					...value.slice(0, alreadySelectedValueIndex),
					...value.slice(alreadySelectedValueIndex + 1)
				];
			else newValue = [...(existingValue || []), newOptionValue];
			if (inputMultipleRef) inputMultipleRef.focus();
		} else {
			newValue = newOptionValue;
		}
		onChange?.(newValue);
		if (!multiple) {
			optionVisible = false;
		}
	};

	const onSelectInputClick: ElementClickEventHandler<MouseEvent> = (e) => {
		// e.stopPropagation();
		// console.log(selectRef);
		changeOptionVisible();
		if (selectRef) selectRef.focus();
		if (inputMultipleRef) inputMultipleRef.focus();
	};

	const onSearchInput: InputComponentChangeHandler = (e) => (searchValue = e.target.value);
	// onDestroy(() => {
	// 	removeBodyClickListener();
	// });
	$: onKeyEscPressHandler = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && optionVisible) {
			optionVisible = false;
		}
	};

	let inputProps: { [key in string]: any } = {
		class: 'w-full hidden placeholder:hidden',
		autocomplete: 'off',
		name,
		value:
			selectedOption?.value ||
			selectedOption?.map?.((o: { label: string; value: any }) => o.value) ||
			'',
		'data-as-array': multiple // to mark which field's value is array so form onsubmit could quickly check for it and JSON.parse the value
	};

	$: {
		let value: any;
		if (multiple) {
			const selectedValues = selectedOption?.map?.((o: { label: string; value: any }) => o.value);
			value = selectedValues?.length ? JSON.stringify(selectedValues) : '';
		} else {
			value = selectedOption?.label;
		}
		inputProps = { ...inputProps, value };
	}
	$: divClassname = `${className} w-full input-substitution cursor-pointer`;
	$: dropdownClasses = optionVisible
		? 'opacity-100 scale-y-100'
		: 'opacity-0 scale overflow-hidden scale-y-0';

	let selectRef: HTMLElement;
	let selectContainerRef: any;
	let inputMultipleRef: HTMLElement;

	onMount(async () => {
		document.addEventListener('keydown', onKeyEscPressHandler);
	});

	onDestroy(() => {
		document.removeEventListener('keydown', onKeyEscPressHandler);
	});
	const dispatch = createEventDispatcher();
	const onInputFocus = (e: any) => {
		if (disabled) return;
		dispatch('focus', e);
		onSelectInputClick(e);
	};
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<Popover
	popoverArrowVisible={false}
	visible={optionVisible}
	backdropVisible={false}
	destroyOnClose={true}
	behaviour="click"
	position="bottom"
>
	<div class="w-full flex" bind:this={selectContainerRef}>
		<input
			{disabled}
			{...inputProps}
			on:click={onSelectInputClick}
			on:input={onSelectInputChange}
		/>
		{#if disableSearch}
			{#if allowAddMore}
				<div class={divClassname}>
					<input
						{disabled}
						on:focus={onInputFocus}
						on:keypress={(e) => {
							const v = e.target.value;
							if (e.key === 'Enter') {
								const newOption = { label: v, value: v };
								// options = options.concat(newOption);
								// onSelectOptionClick(newOption);
								onAddNewOption?.(newOption);
							}
						}}
						on:focusout={(e) => {
							dispatch('focusout', e);
						}}
						bind:this={selectRef}
						value={selectedOption?.label || ''}
					/>
				</div>
			{:else}
				<div
					data-input-focusable
					on:focus
					on:focusout
					bind:this={selectRef}
					on:click={onSelectInputClick}
					class={divClassname}
				>
					<div class="w-full absolute top-0 left-0 h-full placeholder-substitution">
						{selectedOption?.label ? '' : label}
					</div>
					<span
						class:invisible={!selectedOption?.label}
						class="transition-none"
						class:line-clamp-1={!selectedOption?.label}
					>
						{selectedOption?.label || label || ''}
					</span>
				</div>
			{/if}
		{:else}
			<div class="flex flex-wrap gap-1 {divClassname}" on:click={onSelectInputClick}>
				{#if multiple}
					{#each selectedOption as option (option.value)}
						<div
							class="cursor-default rounded-default bg-gray-300 pl-2 flex items-center hover:bg-gray-300"
						>
							<span>{option.label}</span>
							<Icon
								on:click={(e) => {
									e.stopPropagation();
									const newValues = value.filter((v) => v !== option.value);
									onChange?.(newValues);
								}}
								name="close"
								class="px-1 text-xs inline"
							/>
						</div>
					{/each}
				{/if}
				<input
					{disabled}
					on:focusout
					on:focus
					on:blur
					bind:this={inputMultipleRef}
					data-input-focusable
					placeholder={label}
					class="{className} flex-1 !p-0"
					value={searchValue}
					on:input={onSearchInput}
				/>
			</div>
		{/if}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- <Icon
			class={`transition-all duration-100 ${optionVisible ? 'rotate-180' : ''}`}
			on:click={onSelectInputClick}
			name="keyboard_arrow_down"
		/> -->
	</div>
	<svelte:fragment slot="popoverContent">
		<div
			class="input-options-container"
			style="min-width:{selectContainerRef
				? getElementCoordsAndSizes(selectContainerRef).width
				: '150'}px"
			use:clickOutsideElement
			on:outclick={(e) => {
				if (!selectContainerRef?.contains(e.detail.event.target)) changeOptionVisible();
			}}
		>
			{#if !filteredOptions?.length}
				<div class="p-2 flex justify-center items-center">Empty</div>
			{:else}
				{#each filteredOptions as option (option.value)}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div
						class:bg-gray-200={flatten([value])?.includes(option.value)}
						class="p-2 cursor-pointer hover:bg-gray-100 flex items-center"
						on:click={() => {
							onSelectOptionClick(option);
						}}
					>
						{#if optionComponent}
							<svelte:component
								this={optionComponent.component}
								{option}
								{...optionComponent.props || {}}
							/>
						{:else}
							<span>{option.label}</span>
						{/if}
						{#if flatten([value])?.includes(option.value)}
							<Icon name="check" class="text-base ml-2 text-main-blue" />
						{/if}
					</div>
				{/each}
			{/if}
		</div>
	</svelte:fragment>
</Popover>

<style lang="scss">
	.input-substitution {
		& > .placeholder-substitution {
			@apply text-placeholder;
		}
	}
	.input-options-container {
		@apply bg-white z-50 rounded-sm border border-gray-300;
		// @apply transition-all duration-100;
		box-shadow: 0 4px 5px -5px lightgrey;
	}
</style>
