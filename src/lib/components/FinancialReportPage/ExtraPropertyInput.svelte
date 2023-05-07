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
	export let optionsCredit: any[];
	export let optionsDebit: any[];

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
				// if (isCredit && propertiesIndex > 0)
				// 	console.log(
				// 		record[property],
				// 		record[properties[0]],
				// 		extractedOptions,
				// 		placeholderOptions
				// 	);

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
	let inputOptions = [];
	$: {
		inputOptions = getTraverseOptions(isCredit ? optionsCredit : optionsDebit);
	}
	$: onRemoveOption = (removedOpt) => {
		inputOptions = inputOptions.filter(
			({ value, label }) => value !== removedOpt.value && label !== removedOpt.label
		);
		if (inputValue === removedOpt.value) {
			inputValue = undefined;
		}
	};
	$: {
		// if (isCredit && propertiesIndex > 0) console.log('OPTIONS IS', optionsCredit, inputOptions);
	}
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
