<script lang="ts">
	import type { ICommonBankExtraSchema } from '$lib/constants/banks';
	import InputTypes from '$lib/constants/inputTypes';
	import { messagesStore } from '$lib/stores';
	import Dropdown from '../Dropdown.svelte';
	import Input from '../FormRelated/Input/Input.svelte';
	import SelectInput from '../FormRelated/Input/SelectInput.svelte';
	// $: messages = ($messagesStore as any).bankSchema;
	// $: {
	// 	console.log('message', messages);
	// }

	export let bankRecord: Record<string, any>;
	$: bankValueType = Number(bankRecord['credit']) > 0 ? 'credit' : 'debit';
	let selectedValue1 = '';
	let selectedValue2 = '';
	let selectedValue3 = '';

	const extraSchemasGroup1 = {
		credit: [
			{
				value: 'forProfitCredit',
				label: $messagesStore.bankSchema.forProfit
			},
			{ value: 'nonProfitCredit', label: $messagesStore.bankSchema.nonProfit }
		],
		debit: [
			{
				value: 'forProfitDebit',
				label: $messagesStore.bankSchema.forProfit
			},
			{ value: 'nonProfitDebit', label: $messagesStore.bankSchema.nonProfit }
		]
	};

	const extraSchemasGroup2 = {
		forProfitCredit: [
			{
				value: 'revenueProfit',
				label: $messagesStore.bankSchema.revenue
			}
		],
		nonProfitCredit: [
			{
				value: 'revenueNonProfit',
				label: $messagesStore.bankSchema.revenue
			}
		],
		forProfitDebit: [
			{
				value: 'debitForProfitDirectCost',
				label: $messagesStore.bankSchema.debitForProfitDirectCost
			},
			{
				value: 'debitForProfitIndirectCost',
				label: $messagesStore.bankSchema.debitForProfitIndirectCost
			}
		],
		nonProfitDebit: [
			{
				value: 'debitNonProfitDirectCost',
				label: $messagesStore.bankSchema.debitNonProfitDirectCost
			},
			{
				value: 'debitNonProfitIndirectCost',
				label: $messagesStore.bankSchema.debitNonProfitIndirectCost
			}
		]
	};

	const extraSchemasGroup3 = {
		revenueProfit: [
			{
				value: 'individualFirstAidClass',
				label: $messagesStore.bankSchema.individualFirstAidClass
			},
			{
				value: 'corporateFirstAidClass',
				label: $messagesStore.bankSchema.corporateFirstAidClass
			},
			{
				value: 'firstAidKit',
				label: $messagesStore.bankSchema.firstAidKit
			},
			{
				value: 'eLearning',
				label: $messagesStore.bankSchema.eLearning
			},
			{
				value: 'others',
				label: $messagesStore.bankSchema.others
			}
		],
		revenueNonProfit: [
			{
				value: 'projectName1',
				label: $messagesStore.bankSchema.projectName1
			},
			{
				value: 'projectName2',
				label: $messagesStore.bankSchema.projectName2
			},
			{
				value: 'others',
				label: $messagesStore.bankSchema.others
			}
		],
		debitForProfitDirectCost: [
			{
				value: 'individualFirstAidClass',
				label: $messagesStore.bankSchema.individualFirstAidClass
			},
			{
				value: 'corporateFirstAidClass',
				label: $messagesStore.bankSchema.corporateFirstAidClass
			},
			{
				value: 'firstAidKit',
				label: $messagesStore.bankSchema.firstAidKit
			},
			{
				value: 'eLearning',
				label: $messagesStore.bankSchema.eLearning
			}
		],
		debitForProfitIndirectCost: [
			{
				value: 'salaryBenefit',
				label: $messagesStore.bankSchema.salaryBenefit
			},
			{
				value: 'office',
				label: $messagesStore.bankSchema.office
			},
			{
				value: 'marketing',
				label: $messagesStore.bankSchema.marketing
			},
			{
				value: 'transport',
				label: $messagesStore.bankSchema.transport
			},
			{
				value: 'others',
				label: $messagesStore.bankSchema.others
			}
		],
		debitNonProfitDirectCost: [
			{
				value: 'projectName1',
				label: $messagesStore.bankSchema.projectName1
			},
			{
				value: 'projectName2',
				label: $messagesStore.bankSchema.projectName2
			}
		],
		debitNonProfitIndirectCost: [
			{
				value: 'administration',
				label: $messagesStore.bankSchema.administration
			},
			{
				value: 'office',
				label: $messagesStore.bankSchema.office
			},
			{
				value: 'communication',
				label: $messagesStore.bankSchema.communication
			},
			{
				value: 'transport',
				label: $messagesStore.bankSchema.transport
			},
			{
				value: 'others',
				label: $messagesStore.bankSchema.others
			}
		]
	};

	$: {
		const { credit, debit, transactionContent } = bankRecord;
		if (credit > 0) {
			if (
				credit < 700000 &&
				['1life', 'TSC'].some((k) =>
					(transactionContent || '').toLowerCase().includes(k.toLowerCase())
				)
			) {
				selectedValue1 = 'forProfitCredit';
				selectedValue2 = 'revenueProfit';
				selectedValue3 = 'firstAidKit';
			} else if (credit < 5000000) {
				selectedValue1 = 'forProfitCredit';
				selectedValue2 = 'revenueProfit';
				selectedValue3 = 'individualFirstAidClass';
			} else if (
				credit > 7000000 &&
				['MST', 'CTY', 'TNHH'].some((k) =>
					transactionContent.toLowerCase().includes(k.toLowerCase())
				)
			) {
				selectedValue1 = 'forProfitCredit';
				selectedValue2 = 'revenueProfit';
				selectedValue3 = 'corporateFirstAidClass';
			} else if (transactionContent.toLowerCase().includes('vnpay')) {
				selectedValue1 = 'forProfitCredit';
				selectedValue2 = 'revenueProfit';
				selectedValue3 = 'eLearning';
			} else {
				selectedValue1 = 'forProfitCredit';
				selectedValue2 = 'revenueProfit';
				selectedValue3 = 'others';
			}
		}
		// if (debit > 0) {
		// 	if (credit < 700000) {
		// 		selectedValue1 = 'forProfitCredit'
		// 		selectedValue2= 'revenueProfit'
		// 		selectedValue3 = 'firstAidKit'
		// 	}
		// 	else if (credit < 5000000) {
		// 		selectedValue1 = 'forProfitCredit'
		// 		selectedValue2= 'revenueProfit'
		// 		selectedValue3 = 'individualFirstAidClass'
		// 	}
		// 	else if (credit  > 7000000) {
		// 		selectedValue1 = 'forProfitCredit'
		// 		selectedValue2= 'revenueProfit'
		// 		selectedValue3 = 'corporateFirstAidClass'
		// 	} else if (transactionContent.toLowerCase().includes('vnpay')) {
		// 		selectedValue1 = 'forProfitCredit'
		// 		selectedValue2= 'revenueProfit'
		// 		selectedValue3 = 'eLearning'
		// 	} else {
		// 		selectedValue1 = 'forProfitCredit'
		// 		selectedValue2= 'revenueProfit'
		// 		selectedValue3 = 'others'
		// 	}
		// }
	}

</script>

<div class="flex items-center justify-center gap-2">
	<Input
		inputContainerClasName="w-32"
		label="1st Category"
		type={InputTypes.SELECT}
		value={selectedValue1}
		onChange={(opt) => {
			selectedValue1 = opt;
		}}
		options={extraSchemasGroup1[bankValueType]}
	/>
	<Input
		inputContainerClasName="w-32"
		label="2nd Category"
		type={InputTypes.SELECT}
		value={selectedValue2}
		onChange={(opt) => {
			selectedValue2 = opt;
		}}
		options={extraSchemasGroup2[selectedValue1]}
	/>
	<Input
		inputContainerClasName="w-32"
		label="3rd Category"
		type={InputTypes.SELECT}
		value={selectedValue3}
		onChange={(opt) => {
			selectedValue3 = opt;
		}}
		options={extraSchemasGroup3[selectedValue2]}
	/>
</div>

<style lang="scss">
</style>
