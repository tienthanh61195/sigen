<script lang="ts">
	import {
		getBankOptionSuggestion,
		type ICommonBankExtraSchema,
		type bankSchema
	} from '$lib/constants/banks';
	import { ButtonTypes } from '$lib/constants/buttonTypes';
	import InputTypes from '$lib/constants/inputTypes';
	import { messagesStore } from '$lib/stores';
	import Button from '../Button.svelte';
	import Input from '../FormRelated/Input/Input.svelte';
	import * as xlsx from 'xlsx-js-style';
	import BankTableExtraPropertySelector from './BankTableExtraPropertySelector.svelte';
	import romanizeNumber from '$lib/utils/romanizeNumber';
	import { DateTime } from 'luxon';
	import { commonStyle, commonTitleStyle, titleStyle } from '$lib/utils/getDefaultExcelStyle';
	import ExtraPropertyInput from './ExtraPropertyInput.svelte';
	import { isEmpty } from 'lodash';
	export let bankType: string;
	export let standardizedRecords: any[];
	standardizedRecords = standardizedRecords.map((record) => ({
		...record,
		...getBankOptionSuggestion(record)
	}));
	export let standardizedHeaders: string[];
	$: headers = (Object.keys(standardizedRecords?.[0] || {}).filter(
		(k) => !extraProperties.includes(k)
	) || []) as (keyof typeof $messagesStore.bankSchema)[];

	let extraProperties: string[] = ['extra-property-1', 'extra-property-2'];

	$: onAddExtraColumnClick = () => {
		// if (extraProperties?.length) {
		// 	standardizedRecords = standardizedRecords.map((r) => {
		// 		extraProperties.forEach((prop) => delete r[prop]);
		// 		return r;
		// 	});
		// 	extraProperties = [];
		// } else
		extraProperties = extraProperties.concat(`extra-property-${extraProperties.length + 1}`);
	};

	$: onRemoveExtraColumnClick = () => {
		// if (extraProperties?.length) {
		// 	standardizedRecords = standardizedRecords.map((r) => {
		// 		extraProperties.forEach((prop) => delete r[prop]);
		// 		return r;
		// 	});
		// 	extraProperties = [];
		// } else
		if (extraProperties.length === 0) return;
		standardizedRecords = standardizedRecords.map((re) => {
			delete re[extraProperties.at(-1)];
			return re;
		});
		extraProperties = extraProperties.slice(0, extraProperties.length - 1);
	};

	$: onExportClick = () => {
		// table headers
		const worksheetData = [
			[],
			['', commonStyle({ v: 'Date' }), commonStyle({ v: 'Amount' }), commonStyle({ v: 'Subtotal' })]
		];
		// group data for excel display
		const reportTimesOfApperance: any = {};
		let reportTimePeriod = '';

		const { inflows, outflows, inflowsTotal, outflowsTotal } = standardizedRecords.reduce(
			(acc, record, i) => {
				const recordDateFormatWithSecond = DateTime.fromFormat(
					record.transactionDateTime,
					'dd/LL/yyyy HH:mm:ss'
				);
				const recordDateFormatWithoutSecond = DateTime.fromFormat(
					record.transactionDateTime,
					'dd/LL/yyyy HH:mm'
				);
				const recordDate = recordDateFormatWithSecond.isValid
					? recordDateFormatWithSecond.toFormat('LL/yyyy')
					: recordDateFormatWithoutSecond.toFormat('LL/yyyy');
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
				const isInflows = record.credit > 0;

				acc.inflowsTotal += record.credit;
				acc.outflowsTotal += record.debit;
				let traverseDataReference: any = {};
				extraProperties.forEach((property, propertyIndex) => {
					const propertyValue = record[property];
					// ------ handle if Inflows
					if (isInflows) {
						if (propertyIndex === 0) {
							if (!acc.inflows[propertyValue])
								acc.inflows[propertyValue] = { total: 0, data: [], options: {} };
							traverseDataReference = acc.inflows[propertyValue];
						} else {
							if (isEmpty(traverseDataReference[propertyValue] || {})) {
								traverseDataReference[propertyValue] = { total: 0, data: [], options: {} };
							}

							traverseDataReference = traverseDataReference[propertyValue];
						}
						traverseDataReference.data.push(record);
						traverseDataReference.total += record.credit;
					} else {
						// ------ handle if Outflows
						if (propertyIndex === 0) {
							if (!acc.outflows[propertyValue])
								acc.outflows[propertyValue] = { total: 0, data: [], options: {} };
							traverseDataReference = acc.outflows[propertyValue];
						} else {
							if (isEmpty(traverseDataReference[propertyValue] || {})) {
								traverseDataReference[propertyValue] = { total: 0, data: [], options: {} };
							}
							traverseDataReference = traverseDataReference[propertyValue];
						}

						traverseDataReference.data.push(record);
						traverseDataReference.total += record.debit;
					}
					traverseDataReference = traverseDataReference.options;
				});
				return acc;
			},
			{ inflows: {}, outflows: {}, inflowsTotal: 0, outflowsTotal: 0 }
		);
		// console.log({ inflows, outflows, inflowsTotal, outflowsTotal });

		// Revenue section
		worksheetData.push([
			titleStyle('INFLOWS', 'left'),
			titleStyle(''),
			titleStyle(''),
			titleStyle(inflowsTotal, 'center')
		]);

		const pushNestedData = (
			optionObject: Record<string, { total: number; data: any[]; options: Record<string, any> }>,
			indexString = '',
			isCredit = true
		) => {
			Object.entries(optionObject).forEach(([extraProperty, { total, data, options }], i) => {
				const romanizedSectionNumber = romanizeNumber(i + 1);
				if (extraProperty)
					worksheetData.push([
						commonTitleStyle(`${indexString}.${romanizedSectionNumber}. ${extraProperty}`, 'left'),
						'',
						'',
						commonTitleStyle(total, 'center')
					]);
				if (!isEmpty(options)) {
					pushNestedData(options, `${indexString}.${romanizedSectionNumber}`, isCredit);
				} else {
					data.forEach((d) => {
						worksheetData.push([
							d.transactionContent,
							commonStyle({ v: d.transactionDateTime, alignment: 'center' }),
							isCredit ? d.credit : d.debit
						]);
					});
				}
			});
		};
		Object.entries(inflows).forEach(([extraProperty, { total, data, options }], i) => {
			if (extraProperty !== 'undefined') {
				const romanizedSectionNumber = romanizeNumber(i + 1);
				worksheetData.push([
					commonTitleStyle(`${romanizedSectionNumber}. ${extraProperty}`, 'left', '52c41a'),
					'',
					'',
					commonTitleStyle(total, 'center', '52c41a')
				]);

				if (!isEmpty(options)) {
					pushNestedData(options, romanizedSectionNumber, true);
				} else {
					data.forEach((d) => {
						worksheetData.push([
							d.transactionContent,
							commonStyle({ v: d.transactionDateTime, alignment: 'center' }),
							d.credit
						]);
					});
				}
			}
		});
		// Expense section
		worksheetData.push([
			titleStyle('OUTFLOWS', 'left'),
			'',
			'',
			titleStyle(outflowsTotal, 'center')
		]);
		// worksheetData.push([
		// 	titleStyle('B. Expenses', 'left'),
		// 	titleStyle(''),
		// 	titleStyle(''),
		// 	titleStyle(outflowsTotal, 'center')
		// ]);

		Object.entries(outflows).forEach(([extraProperty, { total, data, options }], i) => {
			if (extraProperty !== 'undefined') {
				const romanizedSectionNumber = romanizeNumber(i + 1);
				worksheetData.push([
					commonTitleStyle(`${romanizedSectionNumber}. ${extraProperty}`, 'left', '52c41a'),
					'',
					'',
					commonTitleStyle(total, 'center', '52c41a')
				]);
				if (!isEmpty(options)) {
					pushNestedData(options, romanizedSectionNumber, false);
				} else {
					data.forEach((d) => {
						worksheetData.push([d.transactionContent, d.transactionDateTime, d.debit]);
					});
				}
			}
		});
		const isLoss = inflowsTotal - outflowsTotal < 0;
		worksheetData.push([
			titleStyle('GROSS PROFIT', 'left', isLoss ? 'DC3545' : '52c41a'),
			titleStyle(''),
			titleStyle(''),
			titleStyle(inflowsTotal - outflowsTotal, 'center', isLoss ? 'DC3545' : '52c41a')
		]);

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
	$: {
	}
</script>

<div>
	<div class="mb-4 flex">
		<Button on:click={onAddExtraColumnClick} buttonType={ButtonTypes.SECONDARY}>
			<!-- {extraProperties.length ? 'Remove Extra Column' : 'Add Extra Column'} -->
			Add Column
		</Button>
		<Button class="mx-4" on:click={onRemoveExtraColumnClick} buttonType={ButtonTypes.CANCEL}>
			<!-- {extraProperties.length ? 'Remove Extra Column' : 'Add Extra Column'} -->
			Remove Right Most Column
		</Button>
		<Button on:click={onExportClick} buttonType={ButtonTypes.PRIMARY}>Export Report</Button>
	</div>
	<table class="bank-table">
		<tr>
			{#each headers as header, i (header)}
				<th>{$messagesStore.bankSchema[header]}</th>
			{/each}
			{#each extraProperties as extraProperty, i (extraProperty)}
				<th class="min-w-[220px]">Extra Property - {i + 1}</th>
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
				{#each extraProperties as extraProperty, extraPropertiesIndex (extraProperty)}
					<td class="w-auto items-center">
						<ExtraPropertyInput
							{record}
							bind:records={standardizedRecords}
							property={extraProperty}
							bind:properties={extraProperties}
							propertiesIndex={extraPropertiesIndex}
							{recordIndex}
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
