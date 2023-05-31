import Banks, { bankSchema, type Bank } from '$lib/constants/banks';
import { compact, isNumber, isObjectLike, isString } from 'lodash';
import { read } from 'xlsx';
import convertFinanceNumberToNumber from './convertFinanceNumberToNumber';
import convertExcelDateCodeToString from './convertExcelDateCodeToString';
import { DateTime } from 'luxon';
type BankStringMap = Record<keyof typeof Banks, string | string[]>;
const banksStringMap: BankStringMap = {
	vpBank:
		'Số dư tham chiếu: là số dư thực tế tại thời điểm phát sinh giao dịch, bao gồm cả các giao dịch phát sinh sau giờ khóa sổ giao dịch trong ngày của Ngân hàng.',
	vietinBank: 'contact@vietinbank.vn',
	mbBank:
		'Chứng từ này được xuất tự động từ hệ thống ngân hàng điện tử BIZ MBBank của Ngân hàng TMCP Quân đội.',
	vcBank: 'VIETCOMBANK - Chung niềm tin vững tương lai',
	custom: ['Người thanh toán', 'Nội dung', 'Ghi nợ', 'Ngày', 'STT']
};
const getBankType = (str: string | number) => {
	if (typeof str !== 'string') return '';
	let bankType: keyof typeof Banks | undefined;
	for (const bank in banksStringMap) {
		const bankStringCheck = banksStringMap[bank as keyof typeof Banks]
		if (isString(bankStringCheck)) {
			if (str.indexOf(bankStringCheck) > -1) {
				bankType = bank as keyof typeof Banks;
				break;
			}
		}
	}
	return bankType;
};
const markedAsStartString: Record<keyof typeof Banks, string> = {
	vpBank: 'stt',
	vietinBank: 'stt',
	mbBank: 'stt',
	vcBank: 'ngày giao dịch',
	custom: 'stt'
};

const standardizeBankData = async (file: Blob | File) => {
	const excelFileData = read(await file.arrayBuffer());
	const sheetName = excelFileData.SheetNames[0];
	const sheetData = excelFileData.Sheets[sheetName];
	let rowNumberForStartingRecordIndex, rowNumberForEndingRecordIndex;
	let colLetterForRecordTable = '';
	let bankType: Bank | undefined;
	const bankHeaders: any[] = [];
	let bankRecords: any[] = [];

	// get bank table starting row number
	let accumulateExcelValues = ''
	for (const excelKey in sheetData) {
		const excelValue = sheetData[excelKey]?.v;
		if (
			isObjectLike(excelValue) ||
			excelValue === '' ||
			excelValue === undefined ||
			excelValue === null
		)
			continue;
		if (!bankType) {
			bankType = getBankType(excelValue) || undefined;
			if (bankType) break;
		}
		accumulateExcelValues = accumulateExcelValues + " " + excelValue
	}
	console.log(bankType, accumulateExcelValues)

	if (!bankType && (banksStringMap.custom as string[]).every(str => accumulateExcelValues.indexOf(str) > -1)) {
		bankType = 'custom'
	}

	for (const excelKey in sheetData) {
		const excelValue = sheetData[excelKey]?.v;
		if (
			isObjectLike(excelValue) ||
			excelValue === '' ||
			excelValue === undefined ||
			excelValue === null
		)
			continue;
		let currentRowNumber = '';
		let currentColLetter = '';
		currentRowNumber = excelKey.replace(/[A-z]+/gi, (c) => {
			currentColLetter = c;
			return '';
		});

		if (
			isString(excelValue) &&
			bankType &&
			markedAsStartString[bankType] === excelValue.toLowerCase()
		) {
			rowNumberForStartingRecordIndex = currentRowNumber;
			colLetterForRecordTable = currentColLetter;

			bankHeaders.push({ value: excelValue, col: currentColLetter });
			break;
		}
	}

	// get rest of configs
	for (const excelKey in sheetData) {
		const excelValue = sheetData[excelKey]?.v;
		if (
			isObjectLike(excelValue) ||
			excelValue === '' ||
			excelValue === undefined ||
			excelValue === null
		)
			continue;
		let currentRowNumber = '';
		let currentColLetter = '';
		currentRowNumber = excelKey.replace(/[A-z]+/gi, (c) => {
			currentColLetter = c;
			return '';
		});
		// if bankType is defined, and the row number < starting row number OR
		// ending row number is defined, the row number > ending row number => skip
		if (
			(bankType && Number(currentRowNumber) < Number(rowNumberForStartingRecordIndex)) ||
			(rowNumberForEndingRecordIndex &&
				Number(currentRowNumber) > Number(rowNumberForEndingRecordIndex))
		)
			continue;

		if (
			currentRowNumber === rowNumberForStartingRecordIndex &&
			currentColLetter.charCodeAt(0) > colLetterForRecordTable.charCodeAt(0)
		) {
			bankHeaders.push({ value: excelValue, col: currentColLetter });
		}
		// if (currentColLetter === 'A')
		//   console.log(currentColLetter === colLetterForRecordTable && Number(currentRowNumber) > Number(rowNumberForStartingRecordIndex) && isNaN(Number(excelValue)) && Number(rowNumberForEndingRecordIndex || 0) > Number(currentRowNumber))
		// if (currentColLetter === colLetterForRecordTable && Number(currentRowNumber) > Number(rowNumberForStartingRecordIndex) && isNaN(Number(excelValue)) && Number(rowNumberForEndingRecordIndex || Infinity) > Number(currentRowNumber)) {
		//   rowNumberForEndingRecordIndex = currentRowNumber
		// }
	}

	// get standardized data
	for (const excelKey in sheetData) {
		const excelValue = sheetData[excelKey]?.v;
		if (
			isObjectLike(excelValue) ||
			excelValue === '' ||
			excelValue === undefined ||
			excelValue === null
		)
			continue;
		// check if the excel row key satisfies condition based on the configs
		let currentRowNumber = '';
		let currentColLetter = '';
		currentRowNumber = excelKey.replace(/[A-z]+/gi, (c) => {
			currentColLetter = c;
			return '';
		});
		if (
			Number(currentRowNumber) <= Number(rowNumberForStartingRecordIndex) ||
			bankHeaders.every((bh) => bh.col !== currentColLetter)
		)
			continue;
		const bankRecordIndex = Number(currentRowNumber) - Number(rowNumberForStartingRecordIndex) - 1;
		const header = bankHeaders.find((bh) => bh.col === currentColLetter);
		if (header) {
			if (!bankRecords[bankRecordIndex] && bankType) {
				bankRecords[bankRecordIndex] = { Bank: Banks[bankType] };
				// if (bankType)
			}
			bankRecords[bankRecordIndex] = {
				...(bankRecords[bankRecordIndex] || {}),
				[header.value]: convertFinanceNumberToNumber(excelValue)
			};
		}
	}

	// if (colLetterForRecordTable && rowNumberForStartingRecordIndex) {
	//   let currentRowNumber = '';
	//   let currentColLetter = '';
	//   currentRowNumber = excelKey.replace(/[A-z]+/gi, (c) => { currentColLetter = c; return '' });
	//   // if same row as "STT" but on the right columns => Headers
	//   if (currentRowNumber === rowNumberForStartingRecordIndex && currentColLetter.charCodeAt(0) > colLetterForRecordTable.charCodeAt(0)) {
	//     bankHeaders.push(excelValue);
	//   } else if (Number(currentRowNumber) > Number(rowNumberForStartingRecordIndex) && (rowNumberForEndingRecordIndex || 0) > currentRowNumber) {

	//   }
	// }
	if (!bankType) return '';
	bankRecords = bankRecords.filter((record, i) => {
		// Special case of MBBank having only "transaction amount" instead of dividing into outflow and inflow;
		if (Banks[bankType] === Banks.vietinBank) {
			const amount = record['Số tiền GD'];
			record['Ghi có'] = amount > 0 ? amount : 0;
			record['Ghi nợ'] = amount < 0 ? Math.abs(amount) : 0;
			delete record['Số tiền GD'];
		} else if (Banks[bankType] === Banks.vcBank) {
			record['STT'] = i;
		}
		const correctRecordPropertyStart = Object.keys(record).find(
			(k) => markedAsStartString[bankType] === k.toLowerCase()
		);
		if (
			(correctRecordPropertyStart && isNaN(Number(record[correctRecordPropertyStart]))) ||
			!correctRecordPropertyStart
		) {
			return false;
		}
		return true;
	});
	const schema = bankType ? bankSchema[bankType] : [];
	const standardizedRecords = compact(
		bankRecords.reduce((acc, br, i) => {
			schema.forEach((sch, schemaIndex) => {
				const { value, label } = sch;
				if (sch.value === 'transactionDateTime' && br[label] && isNumber(br[label])) {
					br[label] = DateTime.fromJSDate(convertExcelDateCodeToString(br[label])).toFormat(
						'dd/LL/yyyy'
					);
				}
				acc[i] = { ...(acc[i] || {}), [value]: br[label] };
			});
			if (acc[i] && !acc[i].credit && !acc[i].debit && !acc[i].transactionDateTime) {
				// acc = acc.slice(0, i).concat(acc.slice(i));
				acc.splice(i, 1);
			}
			return acc;
		}, []) || []
	);

	return { bankRecords, bankType, bankHeaders, standardizedRecords };
};

export default standardizeBankData;
