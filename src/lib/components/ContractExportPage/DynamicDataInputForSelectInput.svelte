<script lang="ts">
	import InputTypes from '$lib/constants/inputTypes';
	import LabelPositions from '$lib/constants/labelPositions';
	import { contractExportStore } from '$lib/stores';
	import type { GeneralFunction } from '$lib/types/common';
	import type { InputOption } from '$lib/types/input-component';
	import Input from '../FormRelated/Input/Input.svelte';
	export let templateData: any;
	export let mainSelectValue = '';
	export let formValues: Record<string, any> = {};
	export let onInputValueChange: GeneralFunction;
	$: mainOptionName = Object.keys($contractExportStore.links)[0];

	$: getTemplateNameByDataName = (data: string) => {
		return Object.entries($contractExportStore.templates)
			.reduce((acc, [templateName, template]) => {
				if (template.data.includes(data)) {
					acc.push(templateName);
				}
				return acc;
			}, [] as string[])
			.join(', ');
	};

	const onInputSelectChange = (v) => {
		if (templateData === mainOptionName) {
			mainSelectValue = v;
		}
		onInputValueChange(templateData, v);
	};

	let options: InputOption[] | undefined;

	$: {
		if (options?.length === 1) {
			onInputValueChange(templateData, options[0].value);
			// formValues = { ...formValues, [templateData]: options[0].value };
		}
	}

	$: {
		const links = $contractExportStore.links[mainOptionName];
		if (templateData === mainOptionName) {
			options = Object.keys(links).map((k) => ({
				value: k,
				label: k
			}));
		} else if (mainSelectValue) {
			const nestedLinksByTemplateData = links[mainSelectValue][templateData];
			if (nestedLinksByTemplateData)
				options = links[mainSelectValue][templateData].map(({ value, description }) => {
					let label = `${value} (${description})`;
					if (!isNaN(value)) label = `${Number(value).toLocaleString()} (${description})`;
					return { value, label };
				});
		}
	}
	$: isSelectInput = !!options;
</script>

<Input
	textSuggestion={$contractExportStore.data[templateData]}
	inputContainerClasName="mb-4"
	labelPosition={LabelPositions.TOP}
	label="{templateData} [{getTemplateNameByDataName(templateData)}]"
	name={templateData}
	allowAddMore={false}
	value={formValues[templateData]}
	type={isSelectInput ? InputTypes.SELECT : InputTypes.TEXT}
	onChange={onInputSelectChange}
	{options}
/>

<style lang="postcss">
</style>
