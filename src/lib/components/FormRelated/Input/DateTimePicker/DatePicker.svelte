<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { DAYS_SHORT } from '$lib/constants/dates';
	import type { GeneralFunction } from '$lib/types/common';
	import type { InputComponentChangeHandler } from '$lib/types/input-component';
	import getCalendarDatesObject from '$lib/utils/getCalendarDatesObject';
	import { DateTime } from 'luxon';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let onChange: InputComponentChangeHandler | undefined;
	export let format: string;
	export let value: string | undefined = undefined;
	export let closeCalendarModal: GeneralFunction;
	// export let inputRef: HTMLElement;
	// export let calendarPickerVisible: boolean;
	$: isValidValue = !!value && DateTime.fromFormat(value || '', format).isValid;
	$: valueAsDateTime = value && isValidValue ? DateTime.fromFormat(value, format) : undefined;
	let lastValidValue: DateTime = DateTime.now();
	$: {
		if (isValidValue) lastValidValue = valueAsDateTime as DateTime;
	}
	// $: lastValidValue =
	// 	value && isValidValue
	// 		? DateTime.fromFormat(value, format)
	// 		: (undefined as DateTime | undefined);
	$: calendarDates = getCalendarDatesObject(lastValidValue || DateTime.now());
	const onTodayButtonClick = () => {
		onChange?.(DateTime.now().toFormat(format));
	};
	const onDateClick = (date: DateTime) => {
		onChange?.(date.toFormat(format));
		closeCalendarModal();
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="date-picker">
	<div class="month">
		<div class="flex">
			<Icon
				class="text-md"
				name="keyboard_double_arrow_left"
				on:click={() => {
					lastValidValue = lastValidValue?.minus({ year: 1 });
				}}
			/>
			<Icon
				class="text-md"
				name="keyboard_arrow_left"
				on:click={() => {
					lastValidValue = lastValidValue?.minus({ month: 1 });
				}}
			/>
		</div>
		<div class="cursor-pointer">{lastValidValue?.toFormat('LLLL yyyy')}</div>
		<div class="flex">
			<Icon
				class="text-md"
				name="keyboard_arrow_right"
				on:click={() => {
					lastValidValue = lastValidValue?.plus({ month: 1 });
				}}
			/>
			<Icon
				class="text-md"
				name="keyboard_double_arrow_right"
				on:click={() => {
					lastValidValue = lastValidValue?.plus({ year: 1 });
				}}
			/>
		</div>
	</div>
	<div class="date-weekday">
		{#each DAYS_SHORT as day (day)}
			<div class="weekday">{day}</div>
		{/each}
		{#each calendarDates as date (`${date.year}/${date.month}/${date.day}`)}
			<div
				class="date"
				class:different-month={lastValidValue?.month !== date.month}
				class:today={DateTime.now().toFormat(format) === DateTime.fromObject(date).toFormat(format)}
				class:activeDay={lastValidValue.toFormat(format) ===
					DateTime.fromObject(date).toFormat(format)}
				on:click={() => {
					onDateClick(DateTime.fromObject(date));
				}}
			>
				{date.day}
			</div>
		{/each}
	</div>
	<div class="text-center py-2 cursor-pointer border-t border-input">
		<div on:click={onTodayButtonClick}>Today</div>
	</div>
</div>

<style lang="scss">
	.date-picker {
		@apply grid grid-flow-row grid-cols-1 bg-white border shadow-default rounded-default;
		.month {
			@apply p-3  flex items-center justify-between border-b border-input;
		}
		.date-weekday {
			@apply grid grid-cols-7;
			.weekday {
				@apply p-2 text-center bg-gradient-to-t from-gray-200;
			}
			.date {
				@apply m-1 p-1 text-center rounded-default  cursor-pointer hover:bg-gray-200;
				&.today {
					@apply bg-calendar-today;
				}
				&.different-month {
					@apply text-gray-400;
				}
				&.activeDay {
					@apply bg-main-blue text-white;
				}
			}
		}
	}
</style>
