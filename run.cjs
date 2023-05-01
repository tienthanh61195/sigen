const { isObject, capitalize } = require('lodash');
const fs = require('fs');
const object = {
	en: {
		bankSchema: {
			id: 'Item #',
			transactionDateTime: 'Transaction Date Time',
			credit: 'Credit',
			debit: 'Debit',
			transactionContent: 'Transaction Content',
			mainCategory: 'Category',
			subCategory: 'Sub-category',
			tag: 'Tag',
			forProfit: '',
			nonProfit: '',
			revenue: '',
			individualFirstAidClass: '',
			corporateFirstAidClass: '',
			firstAidKit: '',
			eLearning: '',
			others: '',
			projectName1: '',
			projectName2: '',
			debitForProfitDirectCost: 'COGS/Direct Cost',
			debitForProfitIndirectCost: 'Fixed Cost/Indirect Cost',
			salaryBenefit: 'Salary & Staff Benefit',
			office: '',
			marketing: '',
			transport: '',
			debitNonProfitDirectCost: 'Direct Cost',
			debitNonProfitIndirectCost: 'Indirect Cost',
			administration: '',
			communication: ''
		}
	}
};

const convertObject = (obj) => {
	return Object.entries(obj).reduce((acc, [k, v]) => {
		if (isObject(v)) {
			acc[k] = convertObject(v);
		} else {
			if (v === '') acc[k] = capitalize(k.replace(/[A-Z0-9]/g, (c) => ` ${c?.toUpperCase() || c}`));
			else acc[k] = v;
		}
		return acc;
	}, {});
};

const messagePath = './src/lib/intl/messages.json';
const init = async () => {
	const convertedObject = convertObject(object);
	fs.writeFileSync(messagePath, JSON.stringify(convertedObject));
};

init();
