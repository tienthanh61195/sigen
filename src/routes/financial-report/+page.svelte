<script lang="ts">
	import { read } from 'xlsx';
	import { isString } from 'lodash';
	import standardizeBankData from '$lib/utils/standardizeBankData';
	import BankTable from '$lib/components/FinancialReportPage/BankTable.svelte';

	let banksData: any[] = [];

	const onFileAdd = async (e: any) => {
		const files: any = e.target.files;
		const results = await Promise.all(
			Object.values(files).map(async (file: any) => standardizeBankData(file))
		);
		console.log(results);

		banksData = results;
	};
</script>

<div class="max-h-full overflow-auto p-4">
	<input type="file" on:change={onFileAdd} multiple />
	<div class="mt-6">
		{#each banksData as bankData}
			<BankTable {...bankData} />
		{/each}
	</div>
</div>

<style lang="scss">
</style>
