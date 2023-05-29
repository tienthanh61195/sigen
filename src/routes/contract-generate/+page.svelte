<script context="module">
	import PizZip from 'pizzip';
	import Docxtemplater from 'docxtemplater';
	import { saveAs } from 'file-saver';

	// let reader = new FileReader();
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
	import { isEmpty, isString, keys, merge, uniq } from 'lodash';
	import downloadObjectAsJson from '$lib/utils/downloadObjectAsJson';
	import Icon from '$lib/components/Icon.svelte';
	import getOptionLinkingFromExcel from '$lib/utils/getOptionLinkingFromExcel';
	import DynamicDataInputForSelectInput from '$lib/components/ContractExportPage/DynamicDataInputForSelectInput.svelte';
	// import saveDocsFile from '$lib/utils/saveDocsFile';
	// import { Document } from 'docx';
	const onAddNewTemplateClick = () => {
		modalType = 'add-template';
	};
	let mainSelectValue = '';
	$: mainOptionName = Object.keys($contractExportStore.links)[0];

	let generateContractFormInputValues: Record<string, any> =
		$contractExportStore.generateContractInput || {};

	$: hardcodedLogic = {
		'Giá trị trước VAT': (fValues: Record<string, any>) =>
			Number(Number(fValues['SL đặt hàng'] || 0) * Number(fValues['Đơn giá'])).toLocaleString(),
		'Giá trị VAT': (fValues: Record<string, any>) =>
			Number(
				(Number(fValues['SL đặt hàng'] || 0) *
					Number(fValues['Đơn giá']) *
					Number($contractExportStore.vat)) /
					100
			).toLocaleString(),
		'Giá trị sau VAT': (fValues: Record<string, any>) =>
			Number(
				(Number(fValues['SL đặt hàng'] || 0) *
					Number(fValues['Đơn giá']) *
					(100 + Number($contractExportStore.vat))) /
					100
			).toLocaleString()
	};

	$: {
		let isChanged = false;
		const newFormValues = Object.entries(hardcodedLogic).reduce((acc, [property, calculate]) => {
			if (!generateContractFormInputValues || isEmpty(generateContractFormInputValues)) return acc;
			const newCalculatedValue = calculate(generateContractFormInputValues);
			if (newCalculatedValue) {
				acc[property] = newCalculatedValue;
				isChanged = true;
			}
			return acc;
		}, {} as Record<string, any>);
		if (isChanged) {
			generateContractFormInputValues = { ...generateContractFormInputValues, ...newFormValues };
		}
	}

	$: onContractFormInputValueChange = (name: string, value: any) => {
		if (generateContractFormInputValues[name] !== value) {
			generateContractFormInputValues = { ...generateContractFormInputValues, [name]: value };
			contractExportStore.update((c) => ({
				...c,
				generateContractInput: { ...(c.generateContractInput || {}), [name]: value }
			}));
		}
	};

	let selectedTemplates: string[] = [];
	$: selectedTemplatesData = uniq(
		selectedTemplates.reduce((acc, template) => {
			if ($contractExportStore.templates[template]?.data)
				return acc.concat(...$contractExportStore.templates[template].data);
			return acc;
		}, []) || []
	);

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
	const onAddTemplateLinkFiles = (files: FileList) => {
		for (const i in files) {
			const f = files[i];
			if (typeof f !== 'object') continue;
			const fileName = f.name;
			const isDocFile = fileName.split('.').at(-1).includes('doc') ? true : false;
			if (isDocFile) {
				let reader = new FileReader();
				// if is word doc file
				reader.onload = (e) => {
					const result = reader.result;
					console.log(fileName);
					if (result) {
						const { doc } = readDocFile(result);
						const dynamicData = getDynamicDataFields(doc.getFullText());
						const dynamicDataAsObject =
							dynamicData.reduce((acc, d) => {
								acc[d] = [];
								return acc;
							}, {} as any) || {};
						contractExportStore.update((c) => ({
							...c,
							templates: { ...c.templates, [fileName]: { content: result, data: dynamicData } },
							data: { ...dynamicDataAsObject, ...c.data }
						}));
						templateJustAdded = true;
					}
				};
				reader.readAsBinaryString(f);
			} else {
				// if is excel file
				getOptionLinkingFromExcel(f).then((result) => {
					contractExportStore.update((c) => {
						return { ...c, links: result };
					});
				});
			}
		}
		return;
	};

	$: onGenerateContractClick = () => {
		modalType = 'generate-contract';
	};

	$: onExportConfigurationClick = () => {
		downloadObjectAsJson($contractExportStore, 'config');
	};

	$: onClearConfigurationClick = () => {
		contractExportStore.set({ templates: {}, data: {}, links: {}, vat: 0 });
	};

	const importConfiguration = (files: FileList) => {
		let reader = new FileReader();
		reader.onload = () => {
			if (isString(reader.result)) {
				contractExportStore.update((c) => {
					return merge(c, JSON.parse(reader.result as string));
				});
			}
		};
		reader.readAsText(files[0]);
	};

	const importLinkTemplate = async (files: FileList) => {
		const result = await getOptionLinkingFromExcel(files[0]);
		contractExportStore.update((c) => {
			return { ...c, links: result };
		});
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
	const onVatFieldInputChange = (v: string) => {
		contractExportStore.update((c) => ({ ...c, vat: Number(v || 0) }));
	};

	$: onGenerateContractFormSubmitClick = (formData: Record<string, any>) => {
		formData = Object.entries(formData).reduce((acc, [k, v]) => {
			if (!isNaN(v)) {
				v = Number(v).toLocaleString();
			}
			acc[k] = v;
			return acc;
		}, {} as any);
		selectedTemplates.forEach((template) => {
			const templateContent = $contractExportStore.templates[template].content;
			const { doc, saveDocFile } = readDocFile(templateContent);
			doc.render(formData);
			saveDocFile(doc, template);
		});
		contractExportStore.update((c) => {
			const newDataProperty = Object.entries(c.data).reduce((acc, [k, v]) => {
				if (formData[k]) acc[k] = uniq(v.concat(formData[k]));
				return acc;
			}, {} as { [key in string]: any });
			return { ...c, data: { ...c.data, ...newDataProperty } };
		});
	};

	$: onDeleteTemplateClick = (template: string) => {
		contractExportStore.update((c) => {
			delete c.templates[template];
			return c;
		});
	};
</script>

<!-- <input type="file" on:change={previewFile} /><br /> -->
<div class="p-4">
	<div class="flex gap-10">
		<!-- <Button buttonType={ButtonTypes.PRIMARY} on:click={onAddNewTemplateClick} /> -->
		<Input
			type={InputTypes.FILE}
			onChange={onAddTemplateLinkFiles}
			uploadFileButtonLabel="Add Template/Link"
			uploadFileButtonClassName="bg-main-blue text-white"
			showFile={false}
		/>
		<!-- <Input
			type={InputTypes.FILE}
			onChange={importLinkTemplate}
			uploadFileButtonLabel="Add Link Template"
			uploadFileButtonClassName="bg-btn-secondary text-blue-900"
			showFile={false}
		/> -->
		<Button
			disabled={!selectedTemplates.length}
			buttonType={selectedTemplates.length ? ButtonTypes.SECONDARY : ButtonTypes.DISABLED}
			on:click={onGenerateContractClick}
		>
			Generate Contracts
		</Button>
		<Button buttonType={ButtonTypes.BORDER} on:click={onExportConfigurationClick}>
			Export Configuration
		</Button>
		<Input
			type={InputTypes.FILE}
			onChange={importConfiguration}
			uploadFileButtonLabel="Import Configuration"
		/>
		<Button buttonType={ButtonTypes.DANGER} on:click={onClearConfigurationClick}>
			Clear Configuration
		</Button>
	</div>
	<div class="mt-6">
		<Input
			inputClassName="w-20"
			value={$contractExportStore.vat}
			label="VAT %"
			labelPosition={LabelPositions.LEFT}
			onChange={onVatFieldInputChange}
		/>
	</div>
	<div class="mt-3 flex flex-nowrap gap-10">
		{#each contractTemplates as template}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="border border-main-blue p-2 rounded w-auto flex items-center cursor-pointer"
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
				<button
					class="ml-4 p-2 hover:opacity-70"
					on:click={(e) => {
						e.stopPropagation();
						onDeleteTemplateClick(template.name);
					}}
				>
					<Icon name="delete" class="text-md text-danger" />
				</button>
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
			<Form onSubmit={onAddTemplateLinkFiles}>
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
					<DynamicDataInputForSelectInput
						formValues={generateContractFormInputValues}
						onInputValueChange={onContractFormInputValueChange}
						bind:mainSelectValue
						{templateData}
					/>
				{/each}
				<Button buttonType={ButtonTypes.PRIMARY} type="submit">Generate Contract</Button>
			</Form>
		{/if}
	</div>
</Modal>

<style lang="postcss">
</style>
