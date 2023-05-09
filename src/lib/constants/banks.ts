enum Banks {
	vpBank = 'VP Bank',
	mbBank = 'MB Bank',
	vietinBank = 'VietinBank'
}
export interface ICommonBankExtraSchema {
	value: string;
	label: string;
	options?: ICommonBankExtraSchema[];
}
export const bankSchema: Record<keyof typeof Banks, { value: string; label: string }[]> = {
	vpBank: [
		{ value: 'id', label: 'STT' },
		{ value: 'bankType', label: 'Bank' },
		{ value: 'transactionContent', label: 'Nội dung giao dịch' },
		{ value: 'transactionDateTime', label: 'Thời gian giao dịch' },
		{ value: 'credit', label: 'Số tiền ghi có' },
		{ value: 'debit', label: 'Số tiền ghi nợ' }
	],
	mbBank: [
		{ value: 'id', label: 'STT' },
		{ value: 'bankType', label: 'Bank' },
		{ value: 'transactionContent', label: 'NỘI DUNG' },
		{ value: 'transactionDateTime', label: 'NGÀY GIAO DỊCH' },
		{ value: 'credit', label: 'GHI CÓ' },
		{ value: 'debit', label: 'GHI NỢ' }
	],
	vietinBank: [
		{ value: 'id', label: 'STT' },
		{ value: 'bankType', label: 'Bank' },
		{ value: 'transactionContent', label: 'Nội dung' },
		{ value: 'transactionDateTime', label: 'Ngày' },
		{ value: 'credit', label: 'Ghi có' },
		{ value: 'debit', label: 'Ghi nợ' }
	]
};

export const getBankOptionSuggestion = ({ credit, transactionContent }: any) => {
	const lowercaseTransactionContent = (transactionContent || '').toLowerCase();
	const isCredit = credit > 0;
	let main,
		sub = '';
	// if credit
	if (isCredit) {
		main = 'Revenue';
		if (
			credit < 700000 &&
			['1life', 'TSC'].some((k) => lowercaseTransactionContent.includes(k.toLowerCase()))
		) {
			sub = 'First Aid Kit';
		} else if (credit < 5000000) {
			sub = 'Individual first aid class';
		} else if (
			credit > 7000000 &&
			['MST', 'CTY', 'TNHH'].some((k) => lowercaseTransactionContent.includes(k.toLowerCase()))
		) {
			sub = 'Corporate first aid class';
		} else if (lowercaseTransactionContent.includes('vnpay')) {
			sub = 'E-learning';
		} else {
			sub = 'Others';
		}
	} else {
		if (
			['luong', 'hotel', 'm village'].some((k) =>
				lowercaseTransactionContent.includes(k.toLowerCase())
			)
		) {
			main = 'Fixed expenses';
			sub = 'Salary & Staff Benefit';
		} else if (
			['Google', 'So tay', 'In an'].some((k) =>
				lowercaseTransactionContent.includes(k.toLowerCase())
			)
		) {
			main = 'Fixed expenses';
			sub = 'Office';
		} else if (
			['Facebook', 'Ads', 'Coffee House', 'Highland', 'website', 'matbao', 'freepik'].some((k) =>
				lowercaseTransactionContent.includes(k.toLowerCase())
			)
		) {
			main = 'Fixed expenses';
			sub = 'Marketing';
		} else if (
			['Grab', 'may bay', 'airlines', 'taxi', 'mai linh', 'vina sun'].some((k) =>
				lowercaseTransactionContent.includes(k.toLowerCase())
			)
		) {
			main = 'Fixed expenses';
			sub = 'Transport';
		}
		// else {
		//   main = 'Fixed expenses';
		//   sub = 'Others';
		// }
		else {
			main = 'Cost of goods sold';
		}
	}
	return { ['extra-property-1']: main, ['extra-property-2']: sub };
};

const defaultBankReportGroupOptions = {
	credit: {
		Revenue: [
			'Individual first aid class',
			'Corporate first aid class',
			'First aid kit',
			'E-learning',
			'Others'
		]
	},
	debit: {
		'Cost of goods sold': [
			'Individual first aid class',
			'Corporate first aid class',
			'First aid kit',
			'E-learning'
		],
		'Fixed expenses': ['Salary & Staff Benefit', 'Office', 'Marketing', 'Transport', 'Others']
	}
};
export const defaultBankOptions = {
	credit: Object.entries(defaultBankReportGroupOptions.credit).reduce((acc, [main, subs]) => {
		const subOptions = defaultBankReportGroupOptions.credit[main];
		acc.push({
			value: main,
			label: main,
			options: subOptions.map((opt) => ({ value: opt, label: opt }))
		});
		return acc;
	}, []),
	debit: Object.entries(defaultBankReportGroupOptions.debit).reduce((acc, [main, subs]) => {
		const subOptions = defaultBankReportGroupOptions.debit[main];
		acc.push({
			value: main,
			label: main,
			options: subOptions.map((opt) => ({ value: opt, label: opt }))
		});
		return acc;
	}, [])
};
export default Banks;
export type Bank = keyof typeof Banks;
