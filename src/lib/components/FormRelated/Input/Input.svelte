<script context="module">
	export const commonInputSpacing = '8px';
</script>

<script lang="ts">
	import InputTypes from '$lib/constants/inputTypes';
	import { createEventDispatcher, type SvelteComponent } from 'svelte';
	import BaseInput from './BaseInput.svelte';
	import CheckboxInput from './CheckboxInput.svelte';
	import DateTimePicker from './DateTimePicker/DateTimePicker.svelte';
	import EmailInput from './EmailInput.svelte';
	import PasswordInput from './PasswordInput.svelte';
	import RadioInput from './RadioInput.svelte';
	import RangeInput from './RangeInput.svelte';
	import SelectInput from './SelectInput.svelte';
	import TextInput from './TextInput.svelte';
	import type { ZodTypeAny } from 'zod/lib/types';
	import LABEL_POSITIONS from '$lib/constants/labelPositions';
	import type { InputComponentChangeHandler, InputOption } from '$lib/types/input-component';
	import TextArea from './TextArea.svelte';
	import type { GeneralFunction } from '$lib/types/common';

	export let value: any = undefined;
	export let inputClassName: string | undefined = '';
	export let labelClassName: string | undefined = '';
	export let inputContainerClasName: string | undefined = '';
	export let name = '';
	export let names = '';
	export let label = '';
	export let labelPosition: LABEL_POSITIONS = LABEL_POSITIONS.TOP_OVERRIDE;
	export let type: InputTypes = InputTypes.TEXT;
	export let onChange: InputComponentChangeHandler | undefined = undefined;
	export let options: InputOption[] = [];
	export let format = 'yyyy-LL-dd';
	export let dateTimePickerType: 'full' | 'date' | 'time' = 'full';
	export let minDateTime: string | undefined = undefined;
	export let maxDateTime: string | undefined = undefined;
	export let onAddNewOption: GeneralFunction | undefined = undefined;
	// ------------ USE ZOD FOR VALIDATION ----------------
	export let validation: ZodTypeAny | undefined = undefined;
	export let optionComponent:
		| { component: typeof SvelteComponent; props?: Record<string, any> }
		| undefined = undefined;
	// ------------ USE ZOD FOR VALIDATION ----------------
	// let className;
	// export { className as class };
	let innerValue: any = '';
	$: innerValue = value || '';
	let error = '';
	let isTouched = false;

	$: {
		if (validation) {
			const validationResult = validation.safeParse(innerValue);
			if (!validationResult.success) {
				// console.log(JSON.stringify(validationResult));
				error = validationResult.error.issues[0].message;
			} else {
				error = '';
			}
		}
	}

	let component: typeof SvelteComponent = TextInput;
	$: {
		switch (type) {
			case InputTypes.TEXT:
				component = TextInput;
				break;
			case InputTypes.EMAIL:
				component = EmailInput;
				break;
			case InputTypes.PASSWORD:
				component = PasswordInput;
				break;
			case InputTypes.CHECKBOX:
				component = CheckboxInput;
				break;
			case InputTypes.RADIO:
				component = RadioInput;
				break;
			case InputTypes.DATE_TIME_PICKER:
				component = DateTimePicker;
				break;
			case InputTypes.DATE_TIME_RANGE_PICKER:
				component = DateTimePicker;
				break;
			case InputTypes.SELECT:
				component = SelectInput;
				break;
			case InputTypes.RANGE:
				component = RangeInput;
				break;
			case InputTypes.TEXTAREA:
				component = TextArea;
				break;
			default:
				break;
		}
	}

	const onInputChange: InputComponentChangeHandler = (value, e) => {
		innerValue = value;
		onChange?.(value, e, name);
	};
	const dispatch = createEventDispatcher();
	function onFocusOut(e: any) {
		isTouched = true;
		dispatch('focusout', e);
	}
	const inputTypesWithoutLabelOverride = [InputTypes.CHECKBOX, InputTypes.RADIO];
	const finalLabelPosition =
		labelPosition === LABEL_POSITIONS.TOP_OVERRIDE && inputTypesWithoutLabelOverride.includes(type)
			? LABEL_POSITIONS.LEFT
			: labelPosition;
</script>

<BaseInput
	{inputContainerClasName}
	{inputClassName}
	{labelClassName}
	value={innerValue}
	{label}
	{isTouched}
	{...$$restProps}
	{error}
	labelPosition={finalLabelPosition}
>
	<svelte:component
		this={component}
		on:focusout={onFocusOut}
		on:focus
		on:blur
		{onAddNewOption}
		{options}
		{name}
		{names}
		{label}
		{format}
		{minDateTime}
		{maxDateTime}
		{dateTimePickerType}
		value={innerValue}
		onChange={onInputChange}
		class={inputClassName}
		{optionComponent}
	/>
</BaseInput>
