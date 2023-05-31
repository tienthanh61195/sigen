<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import Button from '$lib/components/Button.svelte';
	import { ButtonTypes } from '$lib/constants/buttonTypes';
	import Input from '$lib/components/FormRelated/Input/Input.svelte';
	import InputTypes from '$lib/constants/inputTypes';
	import { gptArticleGenerateStore } from '$lib/stores';
	import { concat, uniqueId } from 'lodash';
	import { each, onMount } from 'svelte/internal';
	import { v4 as uuidv4 } from 'uuid';
	import Modal from '$lib/components/Modal.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Form from '$lib/components/FormRelated/Form.svelte';
	import ArticleGenerate from '$lib/components/GptArticleGeneratePage/ArticleGenerate.svelte';
	let modalType = '';
	let columns = $gptArticleGenerateStore.columns;
	let savePresetDone = false;
	$: activeColumns = columns.filter((col) => col.active);
	let tableContainerRef: HTMLElement;
	$: dataByColumnLabel = $gptArticleGenerateStore.dataByColumnLabel;
	$: columnPresetOptions = $gptArticleGenerateStore.columnsPreset?.map((col, i) => {
		return {
			label: col.map((c) => c.label).join(', '),
			value: `${i}`
		};
	});
	let row: Record<string, string[]> = {};
	const flipDurationMs = 100;
	function handleDndConsider(e) {
		columns = e.detail.items;
	}
	function handleDndFinalize(e) {
		columns = e.detail.items;
	}

	// $: onAddColumnClick = () => {
	// 	// gptArticleGenerateStore.update(c => {})
	// 	columns = columns.concat({ id: uuidv4(), label: '' });
	// };

	// $: onAddRowClick = () => {
	// 	rows = rows.concat({});
	// };

	$: onClickSaveColumnPreset = () => {
		if (
			$gptArticleGenerateStore.columnsPreset.some(
				(preset) =>
					preset.map((col) => col.label).join(', ') === columns.map((c) => c.label).join(', ')
			)
		)
			return;
		gptArticleGenerateStore.update((c) => ({
			...c,
			columnsPreset: [...c.columnsPreset, columns]
		}));
	};

	const onCustomizeColumnClick = () => {
		modalType = 'customize-column';
	};

	const onGenerateArticleClick = () => {
		modalType = 'generate-article';
	};

	const onResetAllColumnsClick = () => {
		gptArticleGenerateStore.update((c) => ({ ...c, columns: [], columnsPreset: [] }));
		columns = [];
	};

	$: onAddNewOption = (v, { label, id }) => {
		gptArticleGenerateStore.update((c) => {
			c.dataByColumnLabel = {
				...c.dataByColumnLabel,
				[label]: [...(c.dataByColumnLabel[label] || []), { value: v.value, label: v.value }]
			};
			return c;
		});
	};

	const closeModal = () => {
		modalType = '';
	};

	$: {
		gptArticleGenerateStore.update((c) => {
			c.columns = columns;
			return c;
		});
	}

	// $: {
	// 	if (columns.length && rows.length && tableContainerRef) {
	// 		tableContainerRef
	// 			.querySelectorAll(`:not(:nth-child(${columns.length}n + 1))`)
	// 			.forEach((e) => {
	// 				console.log(e);
	// 				e.classList.add('-ml-[1px]');
	// 			});
	// 	}
	// }
</script>

<div class="p-4">
	<div class="flex gap-10 mb-6">
		<!-- <Button buttonType={ButtonTypes.PRIMARY} on:click={onAddNewTemplateClick} /> -->

		<!-- <Input
			type={InputTypes.FILE}
			onChange={importLinkTemplate}
			uploadFileButtonLabel="Add Link Template"
			uploadFileButtonClassName="bg-btn-secondary text-blue-900"
			showFile={false}
		/> -->
		<!-- <Button buttonType={ButtonTypes.PRIMARY} on:click={onAddColumnClick}>Add Column</Button> -->
		<!-- <Button buttonType={ButtonTypes.SECONDARY} on:click={onAddRowClick}>Add Row</Button> -->
		<Button buttonType={ButtonTypes.BORDER} on:click={onCustomizeColumnClick}>
			Customize Columns
		</Button>
		<Button buttonType={ButtonTypes.PRIMARY} on:click={onGenerateArticleClick}>
			Generate Articles
		</Button>
		<Button buttonType={ButtonTypes.DANGER} on:click={onResetAllColumnsClick}>
			Reset All Columns
		</Button>
		<Input
			label="Gpt Key"
			type={InputTypes.PASSWORD}
			value={$gptArticleGenerateStore.gptToken}
			onChange={(v) => {
				gptArticleGenerateStore.update((c) => ({ ...c, gptToken: v }));
			}}
		/>
	</div>
	<div
		bind:this={tableContainerRef}
		class="table_container"
		style="grid-template-columns: repeat({activeColumns.length}, 170px)"
	>
		{#each activeColumns as column, index (column.id)}
			<div
				class="flex items-center justify-center border border-black p-2 {index > 0
					? '-ml-[1px]'
					: ''}"
			>
				{column.label}
			</div>
		{/each}
		{#each activeColumns as column, columnIndex (column.id)}
			<div class="border border-black -mt-[1px] p-2 {columnIndex > 0 ? '-ml-[1px]' : ''}">
				<Input
					multiple={true}
					type={InputTypes.SELECT}
					onAddNewOption={(v) => {
						onAddNewOption(v, column);
					}}
					onChange={(v) => {
						row = { ...(row || {}), [column.id]: v };
					}}
					options={dataByColumnLabel[column.label] || []}
				/>
				{#if row[column.id]}
					{#each row[column.id] as selectedValues}
						<div class="p-2">{selectedValues}</div>
					{/each}
				{/if}
			</div>
		{/each}
	</div>
</div>
<Modal
	containerClassName="max-w-[80%] min-w-[500px]"
	outClickToClose={false}
	header={modalType === 'customize-column' ? 'Customize Columns' : 'Generate Articles'}
	visible={!!modalType}
	on:close={closeModal}
>
	<div class="p-4">
		{#if modalType === 'customize-column'}
			<div class="mb-3">
				<Input
					type={InputTypes.SELECT}
					options={columnPresetOptions}
					label="Select Column Preset"
					onChange={(v) => {
						columns = $gptArticleGenerateStore.columnsPreset[v];
					}}
				/>
			</div>
			<Form
				onSubmit={(value) => {
					if (!value.newColumn) return;
					const id = uuidv4();
					columns = columns.concat({ label: value.newColumn, id, active: true });
				}}
			>
				<div class="flex gap-1 items-center mb-3">
					<Input label="New column" name="newColumn" />
					<Button type="submit" class="p-2"><Icon name="check" /></Button>
				</div>
			</Form>
			{#if columns.length}
				<section
					class="columns_customizer_container"
					use:dndzone={{ items: columns, flipDurationMs }}
					on:consider={handleDndConsider}
					on:finalize={handleDndFinalize}
				>
					{#each columns as item, index (item.id)}
						<div
							class="p-2 border border-input flex items-center gap-2"
							animate:flip={{ duration: flipDurationMs }}
						>
							<span>{item.label}</span>
							<div class="p-1 ml-auto hover:opacity-70 flex items-center cursor-pointer">
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<div
									class="mr-2"
									class:text-general-active={item.active}
									class:text-danger={!item.active}
									on:click={() => {
										const newState = !item.active;
										item.active = newState;
										columns = columns;
									}}
								>
									{item.active ? 'Active' : 'Inactive'}
								</div>
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<Icon
									on:click={() => {
										columns.splice(index, 1);
										columns = columns;
									}}
									class="text-danger"
									name="delete"
								/>
							</div>
						</div>
					{/each}
				</section>
				<div class="flex items-center flex-col">
					<Button class="mt-10" buttonType={ButtonTypes.PRIMARY} on:click={onClickSaveColumnPreset}
						>Save Column Preset</Button
					>
					{#if savePresetDone}
						<div class="text-general-active">Saved!</div>
					{/if}
				</div>
			{/if}
		{:else if modalType === 'generate-article'}
			<ArticleGenerate {row} {columns} />
		{/if}
	</div>
</Modal>

<style lang="postcss">
	.table_container {
		@apply grid grid-rows-[minmax(50px,_auto)] overflow-auto;
	}
	.columns_customizer_container {
		& > :not(:first-child) {
			@apply -mt-[1px];
		}
	}
	.table_container {
	}
</style>
