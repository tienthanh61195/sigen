<script lang="ts">
	import { timeRegEx } from '$lib/constants/regexps';
	import type { GeneralFunction } from '$lib/types/common';
	import type { InputComponentChangeHandler } from '$lib/types/input-component';
	import prefixZero from '$lib/utils/prefixZero';
	import { createEventDispatcher, onDestroy, tick } from 'svelte';
	// const dispatch = createEventDispatcher();
	// export let inputRef: HTMLElement;
	export let onChange: InputComponentChangeHandler | undefined;
	export let value: string | undefined = undefined;
	export let closeCalendarModal: GeneralFunction;
	export let calendarPickerVisible: boolean;
	export let minDateTime: string | undefined;
	export let maxDateTime: string | undefined;
	const minuteInterval = 1;
	const hours: number[] = [...Array(24).keys()];
	const minutes: number[] = Array(60 / minuteInterval)
		.fill(0)
		.map((n, i) => n + minuteInterval * i);

	$: onHourClick = (hour: string) => {
		const newTimeValue = `${hour}:${value?.split(':')?.[1] || '00'}`;
		// inputRef.focus();
		onChange?.(newTimeValue);
	};
	$: onMinuteClick = async (minute: string) => {
		const newTimeValue = `${value?.split(':')[0] || '00'}:${minute}`;
		onChange?.(newTimeValue);
		await tick();
		closeCalendarModal();
	};
	let hourContainer: HTMLElement;
	let minuteContainer: HTMLElement;
	let valueHour: string;
	let valueMinute: string;
	let lastValidValue: string | undefined = '00:00';
	$: {
		if (value && timeRegEx.test(value)) {
			[valueHour, valueMinute] = value.split(':');
			lastValidValue = value;
		}
	}
	$: {
		if (!calendarPickerVisible && lastValidValue) {
			onChange?.(lastValidValue);
		}
	}
	onDestroy(() => {
		onChange?.(lastValidValue);
	});
	$: {
		if (calendarPickerVisible && value && hourContainer && minuteContainer) {
			const [hour, minute] = value.split(':');
			const selectedHour = hourContainer.querySelector(`[data-time-hour="${hour}"]`) as HTMLElement;
			const selectedMinute = minuteContainer.querySelector(
				`[data-time-minute="${minute}"]`
			) as HTMLElement;
			if (selectedHour) hourContainer.scrollTop = selectedHour.offsetTop;
			if (selectedMinute) minuteContainer.scrollTop = selectedMinute.offsetTop;
		}
	}
	// $: {
	// 	if (!calendarPickerVisible && value && !timeRegEx.test(value)) {
	// 		// onChange(lastValidValue);
	// 		// value = lastValidValue;
	// 	}
	// }
	$: isTimeDisabledByMinute = (minute: number) => {
		let [minHour, minMinute]: [string, string] = ['', ''];
		let [maxHour, maxMinute]: [string, string] = ['', ''];
		if (minDateTime && timeRegEx.test(minDateTime)) [minHour, minMinute] = minDateTime?.split(':');
		if (maxDateTime && timeRegEx.test(maxDateTime)) [maxHour, maxMinute] = maxDateTime?.split(':');
		if (lastValidValue && timeRegEx.test(lastValidValue)) {
			const [valueHour] = lastValidValue.split(':');
			if (
				minHour &&
				minMinute &&
				(+valueHour < +minHour || (valueHour === minHour && minute < +minMinute))
			) {
				return true;
			}
			if (
				maxHour &&
				maxMinute &&
				(+valueHour > +maxHour || (valueHour === maxHour && minute > +maxMinute))
			) {
				return true;
			}
		}
		return false;
	};
	const isTimeDisabledByHour = (hour: number) => {
		return (
			(!!minDateTime && hour < +minDateTime.split(':')[0]) ||
			(!!maxDateTime && hour > +maxDateTime.split(':')[0])
		);
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="time-picker">
	<div class="" bind:this={hourContainer}>
		{#each hours as hour (hour)}
			<div
				class="time hour {prefixZero(hour) === valueHour ? 'bg-main-blue text-white' : ''}"
				class:disabled={isTimeDisabledByHour(hour)}
				data-time-hour={prefixZero(hour)}
				on:click={isTimeDisabledByHour(hour)
					? undefined
					: () => {
							onHourClick(prefixZero(hour));
					  }}
			>
				{prefixZero(hour)}
			</div>
		{/each}
	</div>
	<div class="" bind:this={minuteContainer}>
		{#each minutes as minute (minute)}
			<div
				data-time-minute={prefixZero(minute)}
				class="time minute {prefixZero(minute) === valueMinute ? 'bg-main-blue text-white' : ''}"
				class:disabled={isTimeDisabledByMinute(minute)}
				on:click={isTimeDisabledByMinute(minute)
					? undefined
					: () => {
							onMinuteClick(prefixZero(minute));
					  }}
			>
				{prefixZero(minute)}
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	.time-picker {
		@apply bg-white max-h-[200px]  flex;
		& > * {
			@apply overflow-auto p-2;
			.time {
				@apply px-4 py-1 my-1 rounded-default cursor-pointer;
				@apply transition-colors duration-150;
				&:not(.disabled) {
					@apply hover:bg-gray-200 hover:text-black;
				}
				&.disabled {
					@apply text-placeholder;
				}
			}
		}
	}
</style>
