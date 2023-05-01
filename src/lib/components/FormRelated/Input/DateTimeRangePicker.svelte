<script lang="ts">
	import Input from '$lib/components/FormRelated/Input/Input.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import InputTypes from '$lib/constants/inputTypes';
	import type { InputComponentChangeHandler } from '$lib/types/input-component';
	import isTimeSmaller from '$lib/utils/isTimeSmaller';
	export let dateTimePickerType: 'full' | 'date' | 'time' = 'time';
	export let names: [string, string];
	export let labels: [string, string] | undefined = undefined;
	export let onChange: InputComponentChangeHandler | undefined = undefined;
	export let inputContainerClasNames: string[] | undefined = undefined;
	export let values: [string, string] = ['', ''];

	const onInputChange: InputComponentChangeHandler = (d, _, name) => {
		if (name === names[0]) {
			ref.querySelector(`input[name="${names[1]}"]`)?.focus();
			const newValueTo = isTimeSmaller(values[1], d) ? d : values[1] || '';
			values = [d, newValueTo];
		} else {
			const newValueTo = isTimeSmaller(d, values[0]) ? values[0] || '' : d;
			values = [values[0] || '', newValueTo];
		}
		onChange?.(d, _, name);
	};

	let ref: HTMLElement;
</script>

<div class="flex gap-1" bind:this={ref}>
	<Input
		onChange={onInputChange}
		type={InputTypes.DATE_TIME_PICKER}
		{dateTimePickerType}
		label={labels?.[0]}
		name={names[0]}
		value={values[0]}
		inputContainerClasName={inputContainerClasNames?.[0]}
	/>
	<Icon class="text-placeholder" name="keyboard_arrow_right" />
	<Input
		onChange={onInputChange}
		type={InputTypes.DATE_TIME_PICKER}
		{dateTimePickerType}
		label={labels?.[1]}
		name={names[1]}
		value={values[1]}
		minDateTime={values[0]}
		inputContainerClasName={inputContainerClasNames?.[1]}
	/>
</div>
