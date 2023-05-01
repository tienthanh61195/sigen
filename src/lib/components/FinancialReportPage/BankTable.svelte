<script lang="ts">
	import type { ICommonBankExtraSchema } from '$lib/constants/banks';
	import { messagesStore } from '$lib/stores';
	import BankTableExtraPropertySelector from './BankTableExtraPropertySelector.svelte';

	export let bankType: string;
	export let standardizedRecords: any[];
	export let standardizedHeaders: string[];
	$: headers = Object.keys(standardizedRecords[0]) || [];
</script>

<table class="bank-table">
	<tr>
		{#each headers as header, i (header)}
			<th>{$messagesStore.bankSchema[header]}</th>
		{/each}
	</tr>
	{#each standardizedRecords as record}
		<tr>
			{#each headers as header (header)}
				<td
					class:text-left={header === 'transactionContent'}
					class:font-semibold={['credit', 'debit'].includes(header) && Number(record[header]) > 0}
					class:text-lg={['credit', 'debit'].includes(header)}
					class:text-red-500={header === 'debit' && Number(record[header]) > 0}
					class:text-green-500={header === 'credit' && Number(record[header]) > 0}
					class="text-center">{record[header]}</td
				>
			{/each}
			<td><BankTableExtraPropertySelector bankRecord={record} /></td>
		</tr>
	{/each}
</table>

<style lang="scss">
	.bank-table {
		@apply border-collapse overflow-auto;
		& th,
		td {
			@apply border border-black p-3 w-60 h-20;
		}
	}
</style>
