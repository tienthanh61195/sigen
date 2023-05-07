<script lang="ts">
	import { read } from 'xlsx';
	import { isString } from 'lodash';
	import standardizeBankData from '$lib/utils/standardizeBankData';
	import BankTable from '$lib/components/FinancialReportPage/BankTable.svelte';

	let banksData: any[] = [];
	let error = '';
	const onFileAdd = async (e: any) => {
		const files: any = e.target.files;
		const results = await Promise.all(
			Object.values(files).map(async (file: any) => standardizeBankData(file))
		);
		banksData = results.filter((res) => res);
		if (!banksData.length) {
			error = 'Hình như sai file format gòy, chỉ dò được MB, Vietin và VP hoy nha ';
		} else {
			error = '';
		}
	};
</script>

<svelte:head>
	<title>Phân Loại Tài Chính</title>
</svelte:head>
<div class="max-h-full overflow-auto p-4">
	<input type="file" on:change={onFileAdd} multiple />
	<div class="mt-6">
		{#if error}
			<div class="text-danger">{error}&#128556;</div>
		{/if}
		{#each banksData as bankData}
			<BankTable {...bankData} />
		{/each}
	</div>
</div>

<style lang="scss">
</style>
