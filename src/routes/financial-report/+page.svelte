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
		// banksData = results.filter((res) => res);
		// group multiple bank into one
		let currentIndex = 0;
		banksData = results.reduce((acc, res, i) => {
			if (res.standardizedRecords) {
				const newStandardizedRecords = i
					? res.standardizedRecords.map((rec) => ({ ...rec, id: currentIndex + rec.id }))
					: res.standardizedRecords;
				acc = acc.concat(...newStandardizedRecords);
				currentIndex = res.standardizedRecords.length;
			}
			return acc;
		}, []);
		// console.log(banksData);

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
<div class="max-h-full h-full overflow-auto p-4 flex flex-col">
	<div>
		<input type="file" on:change={onFileAdd} multiple />
	</div>
	<div class="mt-3 overflow-hidden">
		{#if error}
			<div class="text-danger">{error}&#128556;</div>
		{/if}
		<!-- {#each banksData as bankData}
			<BankTable {...bankData} />
		{/each} -->
		{#if banksData.length}
			<BankTable standardizedRecords={banksData} />
		{/if}
	</div>
</div>

<style lang="scss">
</style>
