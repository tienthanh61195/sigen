<script lang="ts">
	import Popover from '$lib/components/Popover.svelte';
	import type { InputChangeEventHandler } from '$lib/types/events';
	import type { InputComponentChangeHandler } from '$lib/types/input-component';
	import { createEventDispatcher, getContext, tick } from 'svelte';
	import { inputContext } from '../BaseInput.svelte';
	import DatePicker from './DatePicker.svelte';
	import TimePicker from './TimePicker.svelte';
	export let value: string | undefined = '';
	export let name: string | undefined = undefined;
	export let format = 'yyyy-LL-dd';
	export let minDateTime: string | undefined;
	export let maxDateTime: string | undefined;
	let className: string | undefined = undefined;
	export { className as class };
	export let onChange: InputComponentChangeHandler | undefined = undefined;
	export let dateTimePickerType: 'full' | 'date' | 'time';

	const onInputChange: InputChangeEventHandler = (e) => {
		onChange?.(e.currentTarget.value, e);
	};

	const onCalendarPickChange = (newValue: typeof name) => {
		value = newValue;
		onChange?.(value);
	};

	let inputRef: HTMLElement;
	let calendarPickerVisible = false;

	const closeCalendarModal = () => {
		calendarPickerVisible = false;
		inputRef.blur();
	};
	const openCalendarModal = () => {
		calendarPickerVisible = true;
	};

	const onClickInput = () => {
		openCalendarModal();
	};

	const { blur, focus } = getContext<any>(inputContext);

	const dispatch = createEventDispatcher();
	const onInputBlur = (e: FocusEvent) => {
		if (calendarPickerVisible && inputRef) {
			inputRef.focus();
		} else {
			blur();
			dispatch('blur', e);
		}
	};
	const onInputFocus = (e: FocusEvent) => {
		if (!calendarPickerVisible && inputRef) {
			calendarPickerVisible = true;
			dispatch('focus', e);
		}
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<Popover
	visible={calendarPickerVisible}
	onClosePopover={closeCalendarModal}
	destroyOnClose={true}
	behaviour="click"
	backdropVisible={false}
	position="bottom"
>
	<input
		{name}
		bind:this={inputRef}
		value={value ?? ''}
		on:input={onInputChange}
		class={className}
		on:click={onClickInput}
		on:blur={onInputBlur}
		on:focus={onInputFocus}
	/>
	<svelte:fragment slot="popoverContent">
		<div class="date-time-picker-container">
			{#if dateTimePickerType === 'date'}
				<DatePicker
					{minDateTime}
					{maxDateTime}
					onChange={onCalendarPickChange}
					{closeCalendarModal}
					{value}
					{format}
				/>
			{:else if dateTimePickerType === 'time'}
				<TimePicker
					{minDateTime}
					{maxDateTime}
					onChange={onCalendarPickChange}
					{closeCalendarModal}
					{value}
					{calendarPickerVisible}
				/>
			{:else}{/if}
		</div>
	</svelte:fragment>
</Popover>

<style lang="scss">
	.date-time-picker-container {
		@apply shadow-default rounded-default overflow-hidden;
	}
</style>
