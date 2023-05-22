<script context="module">
	import PizZip from 'pizzip';
	import Docxtemplater from 'docxtemplater';
	import { saveAs } from 'file-saver';

	let reader = new FileReader();
	// reader.addEventListener(
	// 	'load',
	// 	(e) => {
	// 		// this will then display a text file
	// 		const result = e.target?.result;
	// 		if (result) {
	// 			const zip = new PizZip(result);
	// 			const doc = new Docxtemplater(zip, {
	// 				paragraphLoop: true,
	// 				linebreaks: true
	// 			});
	// 			// console.log(doc.getFullText());
	// 			// Render the document (Replace {first_name} by John, {last_name} by Doe, ...)
	// 			doc.render({
	// 				first_name: 'John',
	// 				last_name: 'Doe',
	// 				phone: '0652455478',
	// 				description: 'New Website'
	// 			});

	// 			const blob = doc.getZip().generate({
	// 				type: 'blob',
	// 				mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	// 				// compression: DEFLATE adds a compression step.
	// 				// For a 50MB output document, expect 500ms additional CPU time
	// 				compression: 'DEFLATE'
	// 			});
	// 			// Output the document using Data-URI
	// 			saveAs(blob, 'output.docx');
	// 		}
	// 	},
	// 	false
	// );
</script>

<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Form from '$lib/components/FormRelated/Form.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Input from '$lib/components/FormRelated/Input/Input.svelte';
	import InputTypes from '$lib/constants/inputTypes';
	import LabelPositions from '$lib/constants/labelPositions';
	import { ButtonTypes } from '$lib/constants/buttonTypes';
	import { contractExportStore } from '$lib/stores';
	import readDocFile from '$lib/utils/readDocFile';
	import { uniq } from 'lodash';
	// import saveDocsFile from '$lib/utils/saveDocsFile';
	// import { Document } from 'docx';
	const onAddNewTemplateClick = () => {
		modalType = 'add-template';
	};
	let selectedTemplates: string[] = [];
	$: selectedTemplatesData = uniq(
		selectedTemplates.reduce((acc, template) => {
			return acc.concat(...$contractExportStore.templates[template].data);
		}, []) || []
	);
	$: getTemplateNameByDataName = (data: string) => {
		return Object.entries($contractExportStore.templates)
			.reduce((acc, [templateName, template]) => {
				if (template.data.includes(data)) {
					acc.push(templateName);
				}
				return acc;
			}, [])
			.join(', ');
	};
	// function previewFile(e) {
	// 	const file: any = e.target.files[0];

	// 	if (file) {
	// 		reader.readAsBinaryString(file);
	// 	}
	// }
	const getDynamicDataFields = (content: string) => {
		const regex = new RegExp(/\{[^\}]+\}/g);
		const dynamicData: string[] = [];
		content.match(regex)?.forEach((d) => {
			dynamicData.push(d.slice(1, d.length - 1));
		});
		return dynamicData;
	};
	const onSubmitAddTemplateForm = (d: { type: string; file: File[] }) => {
		const { type, file } = d;
		// contractExportStore.update(c => ({...c, templates: {...c.templates, [d.type]: {content: }}}))
		reader.onload = (e) => {
			const result = reader.result;
			if (result) {
				const { doc, saveDocFile } = readDocFile(result);
				const dynamicData = getDynamicDataFields(doc.getFullText());
				const dynamicDataAsObject =
					dynamicData.reduce((acc, d) => {
						acc[d] = '';
						return acc;
					}, {} as any) || {};
				contractExportStore.update((c) => ({
					...c,
					templates: { ...c.templates, [d.type]: { content: result, data: dynamicData } },
					data: { ...dynamicDataAsObject, ...c.data }
				}));
				templateJustAdded = true;
			}
		};
		reader.readAsBinaryString(file[0]);
	};

	$: onGenerateContractClick = () => {
		modalType = 'generate-contract';
	};
	let templateJustAdded = false;
	$: {
		if (templateJustAdded) {
			setTimeout(() => {
				templateJustAdded = false;
			}, 2000);
		}
	}
	$: contractTemplates = Object.entries($contractExportStore.templates).reduce(
		(acc, [templateName, templateData]) => {
			acc.push({ name: templateName, data: templateData });
			return acc;
		},
		[] as any
	);
	let modalType = '';
	$: modalVisible = !!modalType;

	$: onTemplateSelectClick = (name: string) => {
		const changedTemplateNameIndex = selectedTemplates.findIndex((tempName) => tempName === name);
		const isChecked = changedTemplateNameIndex > -1;
		if (!isChecked) {
			selectedTemplates = selectedTemplates.concat(name);
		} else {
			selectedTemplates.splice(changedTemplateNameIndex, 1);
			selectedTemplates = selectedTemplates;
		}
	};

	$: onGenerateContractFormSubmitClick = (d: Record<string, any>) => {
		selectedTemplates.forEach((template) => {
			const templateContent = $contractExportStore.templates[template].content;
			const { doc, saveDocFile } = readDocFile(templateContent);
			doc.render(d);
			saveDocFile(doc, template);
		});
	};
</script>

<!-- <input type="file" on:change={previewFile} /><br /> -->
<div class="p-4">
	<div class="flex gap-10">
		<Button buttonType={ButtonTypes.PRIMARY} on:click={onAddNewTemplateClick}>
			Add New Template
		</Button>
		<Button
			disabled={!selectedTemplates.length}
			buttonType={selectedTemplates.length ? ButtonTypes.SECONDARY : ButtonTypes.DISABLED}
			on:click={onGenerateContractClick}
		>
			Generate Contracts
		</Button>
	</div>

	<div class="mt-6 flex flex-nowrap gap-10">
		{#each contractTemplates as template}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="border border-main-blue p-2 rounded w-auto"
				on:click={() => {
					onTemplateSelectClick(template.name);
				}}
			>
				<Input
					type={InputTypes.CHECKBOX}
					label={template.name}
					value={selectedTemplates.includes(template.name)}
					onChange={() => {
						onTemplateSelectClick(template.name);
					}}
				/>
			</div>
		{/each}
	</div>
</div>
<Modal
	outClickToClose={false}
	containerClassName="min-w-[300px]"
	on:close={() => {
		modalType = '';
	}}
	bind:visible={modalVisible}
	header={modalType === 'add-template' ? 'Add new file template' : 'Generate Contracts'}
>
	<div class="p-6">
		{#if modalType === 'add-template'}
			<Form onSubmit={onSubmitAddTemplateForm}>
				<div class="mb-6">
					<Input name="type" label="Contract Type" labelPosition={LabelPositions.TOP} />
				</div>
				<div class="mb-6">
					<Input
						type={InputTypes.FILE}
						name="file"
						label="File"
						labelPosition={LabelPositions.TOP}
					/>
				</div>
				<div class="">
					<Button buttonType={ButtonTypes.PRIMARY} type="submit">Submit</Button>
					{#if templateJustAdded}
						<span class="text-general-active">Template Added</span>
					{/if}
				</div>
			</Form>
		{:else if modalType === 'generate-contract'}
			<Form onSubmit={onGenerateContractFormSubmitClick}>
				{#each selectedTemplatesData as templateData}
					<Input
						inputContainerClasName="mb-4"
						labelPosition={LabelPositions.TOP}
						label="{templateData} [{getTemplateNameByDataName(templateData)}]"
						name={templateData}
					/>
				{/each}
				<Button buttonType={ButtonTypes.PRIMARY} type="submit">Submit</Button>
			</Form>
		{/if}
	</div>
</Modal>

<style lang="postcss">
</style>
