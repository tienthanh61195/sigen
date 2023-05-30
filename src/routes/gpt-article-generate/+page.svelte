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
	let columns = $gptArticleGenerateStore.columns.map((col) => ({ id: col.id, name: col.label }));
	let tableContainerRef: HTMLElement;
	$: dataByColumnLabel = $gptArticleGenerateStore.dataByColumnLabel;
	let row: Record<string, string[]> = {};
	const flipDurationMs = 100;
	function handleDndConsider(e) {
		columns = e.detail.items;
	}
	function handleDndFinalize(e) {
		columns = e.detail.items;
	}

	$: onAddColumnClick = () => {
		// gptArticleGenerateStore.update(c => {})
		columns = columns.concat({ id: uuidv4(), name: '' });
	};

	// $: onAddRowClick = () => {
	// 	rows = rows.concat({});
	// };

	const onCustomizeColumnClick = () => {
		modalType = 'customize-column';
	};

	const onGenerateArticleClick = () => {
		modalType = 'generate-article';
	};

	$: onAddNewOption = (v, { name, id }) => {
		gptArticleGenerateStore.update((c) => {
			c.dataByColumnLabel = {
				...c.dataByColumnLabel,
				[name]: [...(c.dataByColumnLabel[name] || []), { value: v.value, label: v.value }]
			};
			return c;
		});
	};

	const closeModal = () => {
		modalType = '';
	};

	$: {
		gptArticleGenerateStore.update((c) => {
			c.columns = columns.map((col) => ({ label: col.name, id: col.id }));
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
		style="grid-template-columns: repeat({columns.length}, 170px)"
	>
		{#each columns as column, index (column.id)}
			<div
				class="flex items-center justify-center border border-black p-2 {index > 0
					? '-ml-[1px]'
					: ''}"
			>
				{column.name}
			</div>
		{/each}
		{#each columns as column, columnIndex (column.id)}
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
					options={dataByColumnLabel[column.name] || []}
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
	containerClassName=" max-w-[80%]"
	header={modalType === 'customize-column' ? 'Customize Columns' : 'Generate Articles'}
	visible={!!modalType}
	on:close={closeModal}
>
	<div class="p-4">
		{#if modalType === 'customize-column'}
			<Form
				onSubmit={(value) => {
					columns = columns.concat({ name: value.newColumn, id: uuidv4() });
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
							<span>{item.name}</span>
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<div
								class="p-1 ml-auto hover:opacity-70 cursor-pointer"
								on:click={() => {
									columns.splice(index, 1);
									columns = columns;
								}}
							>
								<Icon class="text-danger" name="delete" />
							</div>
						</div>
					{/each}
				</section>
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
