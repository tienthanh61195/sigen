<script lang="ts">
	import type { ICommonBankExtraSchema, bankSchema } from '$lib/constants/banks';
	import { ButtonTypes } from '$lib/constants/buttonTypes';
	import InputTypes from '$lib/constants/inputTypes';
	import { messagesStore } from '$lib/stores';
	import Button from '../Button.svelte';
	import Input from '../FormRelated/Input/Input.svelte';
	import * as xlsx from 'xlsx-js-style';
	import BankTableExtraPropertySelector from './BankTableExtraPropertySelector.svelte';
	import romanizeNumber from '$lib/utils/romanizeNumber';
	import { DateTime } from 'luxon';
	export let bankType: string;
	export let standardizedRecords: any[];
	export let standardizedHeaders: string[];
	$: headers = (Object.keys(standardizedRecords[0]).filter((k) => !extraProperties.includes(k)) ||
		[]) as (keyof typeof $messagesStore.bankSchema)[];

	let extraProperties: string[] = [];
	let optionsCredit = JSON.parse(localStorage.getItem('credit') || '[]');
	let optionsDebit = JSON.parse(localStorage.getItem('debit') || '[]');
	const alignmentOnly = (v, alignment = 'center') => ({
		v,
		t: 's',
		s: {
			alignment: { vertical: 'center', horizontal: alignment }
		}
	});
	const titleStyle = (v, alignment = 'left') => ({
		v,
		t: 's',
		s: {
			alignment: { vertical: 'center', horizontal: alignment },
			font: { bold: true, color: { rgb: '1d3993' }, sz: '14' }
			// fill: { bgColor: { rgb: 'FF0000' } }
		}
	});
	const subTitleStyle = (v, alignment = 'left') => ({
		v,
		t: 's',
		s: {
			alignment: { vertical: 'center', horizontal: alignment },
			font: { bold: true, color: { rgb: 'ff9300' }, sz: '14' }
		}
	});

	$: onAddExtraColumnClick = () => {
		if (extraProperties?.length) {
			standardizedRecords = standardizedRecords.map((r) => {
				extraProperties.forEach((prop) => delete r[prop]);
				return r;
			});
			extraProperties = [];
		} else extraProperties = extraProperties.concat(`extra-property`);
	};
	$: onExportClick = () => {
		// table headers
		const worksheetData = [
			[],
			['', alignmentOnly('Date'), alignmentOnly('Amount'), alignmentOnly('Subtotal')]
		];
		// group data for excel display
		const reportTimesOfApperance: any = {};
		let reportTimePeriod = '';
		const { revenues, expenses, revenuesTotal, expensesTotal } = standardizedRecords.reduce(
			(acc, record, i) => {
				const recordDate = DateTime.fromFormat(
					record.transactionDateTime,
					'dd/LL/yyyy HH:mm'
				).toFormat('LL/yyyy');
				reportTimesOfApperance[recordDate] = (reportTimesOfApperance[recordDate] || 0) + 1;
				if (i === standardizedRecords.length - 1) {
					let currentMaxCount = 0;
					Object.entries(reportTimesOfApperance).forEach(([time, count]: any) => {
						if (count > currentMaxCount) {
							currentMaxCount = count;
							reportTimePeriod = time;
						}
					});
				}
				const propertyValue = record[extraProperties[0]];
				const isRevenue = record.credit > 0;
				// ------ handle if revenue
				if (isRevenue) {
					if (!acc.revenues[propertyValue]) acc.revenues[propertyValue] = { total: 0, data: [] };
					acc.revenues[propertyValue].data.push(record);
					acc.revenues[propertyValue].total += record.credit;
					acc.revenuesTotal += record.credit;
				} else {
					// ------ handle if expenses
					if (!acc.expenses[propertyValue]) acc.expenses[propertyValue] = { total: 0, data: [] };
					acc.expenses[propertyValue].data.push(record);
					acc.expenses[propertyValue].total += record.debit;
					acc.expensesTotal += record.debit;
				}
				return acc;
			},
			{ revenues: {}, expenses: {}, revenuesTotal: 0, expensesTotal: 0 }
		);

		// Revenue section
		worksheetData.push([
			titleStyle('A. Revenue', 'left'),
			titleStyle(''),
			titleStyle(''),
			titleStyle(revenuesTotal, 'center')
		]);
		worksheetData.push(
			Object.entries(revenues).reduce((acc, [extraProperty, { total, data }], i) => {
				if (extraProperty !== 'undefined') {
					const romanizedSectionNumber = romanizeNumber(i + 1);
					worksheetData.push([
						subTitleStyle(`${romanizedSectionNumber}. ${extraProperty}`, 'left'),
						'',
						'',
						subTitleStyle(total, 'center')
					]);
				}
				data.forEach((d) => {
					worksheetData.push([d.transactionContent, d.transactionDateTime, d.credit]);
				});
				return acc;
			}, [])
		);
		// Expense section
		worksheetData.push([
			titleStyle('B. Expenses', 'left'),
			titleStyle(''),
			titleStyle(''),
			titleStyle(expensesTotal, 'center')
		]);
		worksheetData.push(
			Object.entries(expenses).reduce((acc, [extraProperty, { total, data }], i) => {
				if (extraProperty !== 'undefined') {
					const romanizedSectionNumber = romanizeNumber(i + 1);
					worksheetData.push([
						subTitleStyle(`${romanizedSectionNumber}. ${extraProperty}`),
						'',
						'',
						subTitleStyle(total, 'center')
					]);
				}
				data.forEach((d) => {
					worksheetData.push([d.transactionContent, d.transactionDateTime, d.debit]);
				});
				return acc;
			}, [])
		);
		const wb = xlsx.utils.book_new();
		const ws = xlsx.utils.aoa_to_sheet(worksheetData);
		xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
		xlsx.utils.sheet_add_aoa(
			ws,
			[
				[
					{
						v: `BÁO CÁO TÀI CHÍNH THÁNG ${reportTimePeriod}`,
						t: 's',
						s: {
							font: { sz: '15' }
						}
					}
				]
			],
			{
				origin: 'A1'
			}
		);
		// // const ws = workbook.Sheets['Sheet1'];
		// // xlsx.utils.sheet_add_json(ws, [['Created ' + new Date().toISOString()], ['dcmvcl']], {
		// // 	origin: -1
		// // });
		// // Package and Release Data (`writeFile` tries to write and save an XLSB file)
		const wscols = [{ wch: 50 }, { wch: 22 }, { wch: 15 }, { wch: 15 }];
		const wsrows = [{ hpx: 20 }];
		const merge = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
		ws['!merges'] = merge;
		ws['!cols'] = wscols;
		ws['!rows'] = wsrows;
		xlsx.writeFile(wb, `${bankType}-${reportTimePeriod}.xlsx`, {});
	};
</script>

<div>
	<div class="mb-4 flex">
		<Button
			on:click={onAddExtraColumnClick}
			buttonType={extraProperties.length ? ButtonTypes.CANCEL : ButtonTypes.SECONDARY}
		>
			{extraProperties.length ? 'Remove Extra Column' : 'Add Extra Column'}
		</Button>
		<Button on:click={onExportClick} class="ml-4" buttonType={ButtonTypes.PRIMARY}>
			Export Report
		</Button>
	</div>
	<table class="bank-table">
		<tr>
			{#each headers as header, i (header)}
				<th>{$messagesStore.bankSchema[header]}</th>
			{/each}
			{#each extraProperties as extraProperty, i (extraProperty)}
				<th>Extra Property - {i + 1}</th>
			{/each}
		</tr>
		{#each standardizedRecords as record, recordIndex}
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
				{#each extraProperties as extraProperty (extraProperty)}
					<td class="w-auto items-center">
						<Input
							onChange={(opt) => {
								record[extraProperty] = opt;
								standardizedRecords[recordIndex] = record;
								standardizedRecords = standardizedRecords;
							}}
							onAddNewOption={(opt) => {
								const isCredit = record.credit > 0;
								if (isCredit) {
									optionsCredit = optionsCredit.concat(opt);
									localStorage.credit = JSON.stringify(optionsCredit);
								} else {
									optionsDebit = optionsDebit.concat(opt);
									localStorage.debit = JSON.stringify(optionsDebit);
								}
							}}
							options={record.credit > 0 ? optionsCredit : optionsDebit}
							type={InputTypes.SELECT}
							name={extraProperty}
						/>
					</td>
				{/each}
			</tr>
		{/each}
	</table>
</div>

<style lang="scss">
	.bank-table {
		@apply border-collapse overflow-auto;
		& th,
		td {
			@apply border border-black p-3 h-20;
		}
	}
</style>
