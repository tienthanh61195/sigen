<script lang="ts">
	import { defaultBankOptions, getBankOptionSuggestion } from '$lib/constants/banks';
	import InputTypes from '$lib/constants/inputTypes';
	import Input from '../FormRelated/Input/Input.svelte';
	export let propertiesIndex = 0;
	export let record: Record<string, any>;
	export let records: any[];
	export let property: string;
	export let properties: string[];
	export let recordIndex = 0;
	const optionsCreditFromLocalStorage = JSON.parse(localStorage.getItem('credit') || '[]');
	const optionsDebitFromLocalStorage = JSON.parse(localStorage.getItem('debit') || '[]');
	let optionsCredit = [
		...optionsCreditFromLocalStorage,
		...defaultBankOptions.credit.filter(({ value }) =>
			Object.values(optionsCreditFromLocalStorage).every((o) => o.value !== value)
		)
	];
	let optionsDebit = [
		...optionsDebitFromLocalStorage,
		...defaultBankOptions.debit.filter(({ value }) =>
			Object.values(optionsDebitFromLocalStorage).every((o) => o.value !== value)
		)
	];
	$: isCredit = record.credit > 0;
	$: getTraverseOptions = (mainOptionsObject: Record<string, any>[]) => {
		let placeholderOptions = mainOptionsObject;
		if (propertiesIndex > 0) {
			// let accumulatedOptions = [];
			//[{label: 'test', value: 'ting', options: [{value: 'vai', label: 'vai'}]}]
			// traverseOptionsCredit = optionsCredit;
			properties.slice(0, propertiesIndex).forEach((prop) => {
				const extractedOptions = placeholderOptions.find(
					(optCred) => optCred.value === record[prop]
				);
				if (extractedOptions) {
					if (!extractedOptions.options) {
						extractedOptions.options = [];
					}
					placeholderOptions = extractedOptions.options;
				}
			});
		}
		return placeholderOptions;
	};

	// $: {
	// 	console.log('traverse', traverseOptions);
	// }

	$: onAddNewOption = (opt) => {
		if (isCredit) {
			if (propertiesIndex === 0) {
				optionsCredit = optionsCredit.concat(opt);
			} else {
				// let accumulatedOptions = [];
				//[{label: 'test', value: 'ting', options: [{value: 'vai', label: 'vai'}]}]
				const traverseOptions = getTraverseOptions(optionsCredit);
				traverseOptions.push({ value: opt.value, label: opt.value });
				optionsCredit = optionsCredit;
			}
			localStorage.credit = JSON.stringify(optionsCredit);
		} else {
			if (propertiesIndex === 0) {
				optionsDebit = optionsDebit.concat(opt);
			} else {
				const traverseOptions = getTraverseOptions(optionsDebit);
				traverseOptions.push({ value: opt.value, label: opt.value });
				optionsDebit = optionsDebit;
			}
			localStorage.debit = JSON.stringify(optionsDebit);
		}
	};
	$: inputValue = record[property];
	$: inputOptions = getTraverseOptions(isCredit ? optionsCredit : optionsDebit);
	$: onRemoveOption = (removedOpt) => {
		inputOptions = inputOptions.filter(
			({ value, label }) => value !== removedOpt.value && label !== removedOpt.label
		);
		if (inputValue === removedOpt.value) {
			inputValue = undefined;
		}
	};
</script>

<Input
	disabled={propertiesIndex > 0 && record[properties[propertiesIndex - 1]] === undefined}
	onChange={(opt) => {
		record[property] = opt;
		records[recordIndex] = record;
		records = records;
	}}
	value={inputValue}
	{onAddNewOption}
	{onRemoveOption}
	options={inputOptions}
	type={InputTypes.SELECT}
	name={property}
/>

<style lang="postcss">
</style>
