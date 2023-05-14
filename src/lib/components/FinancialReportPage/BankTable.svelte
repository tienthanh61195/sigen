<script lang="ts">
	import {
		getBankOptionSuggestion,
		type ICommonBankExtraSchema,
		type bankSchema,
		defaultBankOptions
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
	import { isEmpty, isString } from 'lodash';
	import Icon from '../Icon.svelte';
	// export let bankType: string;
	export let standardizedRecords: any[];
	let extraRecords: any[] = [];
	standardizedRecords = standardizedRecords.map((record) => ({
		...record,
		...getBankOptionSuggestion(record)
	}));
	$: headers = (Object.keys(standardizedRecords?.[0] || {}).filter(
		(k) => !extraProperties.includes(k)
	) || []) as (keyof typeof $messagesStore.bankSchema)[];

	let extraProperties: string[] = ['extra-property-1', 'extra-property-2'];

	$: onAddExtraRowClick = () => {
		// if (extraProperties?.length) {
		// 	standardizedRecords = standardizedRecords.map((r) => {
		// 		extraProperties.forEach((prop) => delete r[prop]);
		// 		return r;
		// 	});
		// 	extraProperties = [];
		// } else
		extraRecords = extraRecords.concat({
			id: standardizedRecords.length + 1 + extraRecords.length
		});
	};

	$: {
		if (extraRecords.length > 0 && bankTableContainerRef) {
			bankTableContainerRef.scrollTo(0, bankTableContainerRef.scrollHeight);
		}
	}

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
		const aggregateRecords = standardizedRecords.concat(...extraRecords);

		const worksheetData = [
			[],
			['', commonStyle({ v: 'Date' }), commonStyle({ v: 'Amount' }), commonStyle({ v: 'Subtotal' })]
		];
		// group data for excel display
		const reportTimesOfApperance: any = {};
		let reportTimePeriod = '';

		let { inflows, outflows, inflowsTotal, outflowsTotal } = aggregateRecords.reduce(
			(acc, record, i) => {
				record.credit = Number(record.credit || 0);
				record.debit = Number(record.debit || 0);

				const recordDateFormatWithSecond = DateTime.fromFormat(
					record.transactionDateTime,
					'dd/LL/yyyy HH:mm:ss'
				);
				const recordDateFormatWithoutSecond = DateTime.fromFormat(
					record.transactionDateTime,
					'dd/LL/yyyy HH:mm'
				);
				const recordDateFormatWithoutTime = DateTime.fromFormat(
					record.transactionDateTime,
					'dd/LL/yyyy'
				);
				const recordDate =
					[recordDateFormatWithSecond, recordDateFormatWithoutSecond, recordDateFormatWithoutTime]
						.find((date) => date.isValid)
						?.toFormat('LL/yyyy') || '';
				reportTimesOfApperance[recordDate] = (reportTimesOfApperance[recordDate] || 0) + 1;
				if (i === aggregateRecords.length - 1) {
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
							commonStyle({ v: isCredit ? d.credit : d.debit, alignment: 'left' })
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
			titleStyle(''),
			titleStyle(''),
			titleStyle(outflowsTotal, 'center')
		]);
		// worksheetData.push([
		// 	titleStyle('B. Expenses', 'left'),
		// 	titleStyle(''),
		// 	titleStyle(''),
		// 	titleStyle(outflowsTotal, 'center')
		// ]);
		const outFlowsDefaultProperties = [
			'Cost of goods sold',
			[
				titleStyle('GROSS PROFIT', 'left', '385d7e'),
				titleStyle('', 'center', '385d7e'),
				titleStyle('', 'center', '385d7e'),
				titleStyle(inflowsTotal - outflows['Cost of goods sold'].total, 'center', '385d7e')
			],
			'Fixed expenses'
		];
		outFlowsDefaultProperties.forEach((extraProperty, i) => {
			if (isString(extraProperty)) {
				if (outflows[extraProperty]) {
					const { total, data, options } = outflows[extraProperty];
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
			} else {
				worksheetData.push(extraProperty);
			}
		});
		Object.entries(outflows).forEach(([extraProperty, { total, data, options }], i) => {
			if (extraProperty !== 'undefined' && !outFlowsDefaultProperties.includes(extraProperty)) {
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
		// const isLoss = inflowsTotal - outflowsTotal < 0;
		worksheetData.push([
			titleStyle('NET PROFIT', 'left', '385d7e'),
			titleStyle('', 'center', '385d7e'),
			titleStyle('', 'center', '385d7e'),
			titleStyle(inflowsTotal - outflowsTotal, 'center', '385d7e')
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
		xlsx.writeFile(wb, `report-${reportTimePeriod}.xlsx`, {});
	};
	const optionsCreditFromLocalStorage = JSON.parse(localStorage.getItem('credit') || '[]');
	const optionsDebitFromLocalStorage = JSON.parse(localStorage.getItem('debit') || '[]');
	let optionsCredit = [
		...optionsCreditFromLocalStorage,
		...defaultBankOptions.credit.filter(({ value }) =>
			Object.values(optionsCreditFromLocalStorage).every((o) => o.value !== value)
		)
	];
	let optionsDebit = [
		...optionsDebitFromLocalStorage,
		...defaultBankOptions.debit.filter(({ value }) =>
			Object.values(optionsDebitFromLocalStorage).every((o) => o.value !== value)
		)
	];
	const headerSizes = {
		id: 5,
		bankType: 5,
		transactionContent: 25,
		transactionDateTime: 12,
		credit: 9,
		debit: 9
	};
	let bankTableContainerRef: any;
</script>

<div class="h-full w-full flex flex-col">
	<div class="mb-4 flex">
		<Button on:click={onAddExtraRowClick} buttonType={ButtonTypes.BORDER}>
			<!-- {extraProperties.length ? 'Remove Extra Column' : 'Add Extra Column'} -->
			Add Row
		</Button>
		<Button class="ml-4" on:click={onAddExtraColumnClick} buttonType={ButtonTypes.SECONDARY}>
			<!-- {extraProperties.length ? 'Remove Extra Column' : 'Add Extra Column'} -->
			Add Column
		</Button>
		<Button class="mx-4" on:click={onRemoveExtraColumnClick} buttonType={ButtonTypes.CANCEL}>
			<!-- {extraProperties.length ? 'Remove Extra Column' : 'Add Extra Column'} -->
			Remove Right Most Column
		</Button>
		<Button on:click={onExportClick} buttonType={ButtonTypes.PRIMARY}>Export Report</Button>
	</div>
	<div class="w-full h-full overflow-auto" bind:this={bankTableContainerRef}>
		<table class="bank-table w-full">
			<tr>
				{#each headers as header, i (header)}
					<th style="width:{headerSizes[header] ? `${headerSizes[header]}%` : 'auto'}"
						>{$messagesStore.bankSchema[header]}</th
					>
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
							class:font-semibold={['credit', 'debit'].includes(header) &&
								Number(record[header] || 0) > 0}
							class:text-lg={['credit', 'debit'].includes(header)}
							class:text-red-500={header === 'debit' && Number(record[header] || 0) > 0}
							class:text-green-500={header === 'credit' && Number(record[header] || 0) > 0}
							class="text-center"
						>
							{['credit', 'debit'].includes(header)
								? (record[header] || 0).toLocaleString()
								: record[header]}
						</td>
					{/each}
					{#each extraProperties as extraProperty, extraPropertiesIndex (extraProperty)}
						<td class="w-auto items-center">
							<ExtraPropertyInput
								bind:optionsCredit
								bind:optionsDebit
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
			{#each extraRecords as record, recordIndex (record.id)}
				<tr>
					{#each headers as header (header)}
						<td class="text-center">
							{#if header === 'id'}
								<div class="flex justify-center items-center">
									<Button
										on:click={() => {
											extraRecords = extraRecords
												.slice(0, recordIndex)
												.concat(extraRecords.slice(recordIndex + 1));
										}}
										style="padding:5px"
										class="w-10 border-danger"
										buttonType={ButtonTypes.BORDER}
										><Icon name="close" class="text-danger text-sm" /></Button
									>
								</div>
							{:else}
								<div>
									<Input
										value={record[header]}
										onChange={(v) => {
											if (header === 'credit' && Number(v) > 0) {
												v = Number(v);
												record['debit'] = 0;
											} else if (header === 'debit' && Number(v) > 0) {
												v = Number(v);
												record['credit'] = 0;
											}
											record[header] = v;
											extraRecords[recordIndex] = record;
											extraRecords = extraRecords;
										}}
									/>
								</div>
							{/if}
						</td>
					{/each}
					{#each extraProperties as extraProperty, extraPropertiesIndex (extraProperty)}
						<td class="w-auto items-center">
							<ExtraPropertyInput
								bind:optionsCredit
								bind:optionsDebit
								{record}
								bind:records={extraRecords}
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
</div>

<style lang="scss">
	.bank-table {
		@apply border-collapse overflow-auto;
		& th,
		td {
			@apply border border-black p-1 h-20;
		}
	}
</style>
