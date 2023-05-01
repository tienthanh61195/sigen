import Banks, { bankSchema, type Bank } from "$lib/constants/banks";
import { isNumber, isObjectLike, isString } from "lodash";
import { read } from "xlsx";
import convertFinanceNumberToNumber from "./convertFinanceNumberToNumber";
type BankStringMap = Record<string, string>
const banksStringMap: BankStringMap = {
  vpBank: "Số dư tham chiếu: là số dư thực tế tại thời điểm phát sinh giao dịch, bao gồm cả các giao dịch phát sinh sau giờ khóa sổ giao dịch trong ngày của Ngân hàng.",
  vietinBank: "contact@vietinbank.vn",
  mbBank: "Chứng từ này được xuất tự động từ hệ thống ngân hàng điện tử BIZ MBBank của Ngân hàng TMCP Quân đội."
}
const getBankType = (str: string | number) => {
  if (typeof str !== 'string') return ''
  let bankType: any;
  for (const bank in banksStringMap) {


    if (str.indexOf(banksStringMap[bank]) > -1) {
      bankType = bank
      break;
    }
  }
  return bankType
}


const standardizeBankData = async (file: Blob | File) => {
  const excelFileData = read(await file.arrayBuffer());
  const sheetName = excelFileData.SheetNames[0];
  const sheetData = excelFileData.Sheets[sheetName];
  let rowNumberForStartingRecordIndex, rowNumberForEndingRecordIndex;
  let colLetterForRecordTable = '';
  const markedAsStartString = ['stt'];
  let bankType: Bank | undefined;
  const bankHeaders: any[] = []
  let bankRecords: any[] = [];

  // get bank table starting row number

  for (const excelKey in sheetData) {
    const excelValue = sheetData[excelKey]?.v;
    if (isObjectLike(excelValue) || excelValue === '' || excelValue === undefined || excelValue === null) continue;
    if (!bankType) bankType = getBankType(excelValue) || '';
    let currentRowNumber = '';
    let currentColLetter = '';
    currentRowNumber = excelKey.replace(/[A-z]+/gi, (c) => { currentColLetter = c; return '' });

    if (isString(excelValue) && markedAsStartString.includes(excelValue.toLowerCase())) {
      rowNumberForStartingRecordIndex = currentRowNumber;
      colLetterForRecordTable = currentColLetter
      bankHeaders.push({ value: excelValue, col: currentColLetter })
      break;
    }
  }

  // get rest of configs
  for (const excelKey in sheetData) {
    const excelValue = sheetData[excelKey]?.v;
    if (isObjectLike(excelValue) || excelValue === '' || excelValue === undefined || excelValue === null) continue;
    if (!bankType) bankType = getBankType(excelValue) || '';
    let currentRowNumber = '';
    let currentColLetter = '';
    currentRowNumber = excelKey.replace(/[A-z]+/gi, (c) => { currentColLetter = c; return '' });
    // if bankType is defined, and the row number < starting row number OR
    // ending row number is defined, the row number > ending row number => skip
    if ((bankType && Number(currentRowNumber) < Number(rowNumberForStartingRecordIndex)) || (rowNumberForEndingRecordIndex && Number(currentRowNumber) > Number(rowNumberForEndingRecordIndex))) continue;

    if (currentRowNumber === rowNumberForStartingRecordIndex && currentColLetter.charCodeAt(0) > colLetterForRecordTable.charCodeAt(0)) {
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
    if (isObjectLike(excelValue) || excelValue === '' || excelValue === undefined || excelValue === null) continue;
    // check if the excel row key satisfies condition based on the configs
    let currentRowNumber = '';
    let currentColLetter = '';
    currentRowNumber = excelKey.replace(/[A-z]+/gi, (c) => { currentColLetter = c; return '' });
    if (Number(currentRowNumber) <= Number(rowNumberForStartingRecordIndex) || bankHeaders.every(bh => bh.col !== currentColLetter)) continue;
    const bankRecordIndex = Number(currentRowNumber) - Number(rowNumberForStartingRecordIndex) - 1;
    const header = bankHeaders.find(bh => bh.col === currentColLetter)
    if (header) {
      bankRecords[bankRecordIndex] = { ...(bankRecords[bankRecordIndex] || {}), [header.value]: convertFinanceNumberToNumber(excelValue) }
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
  bankRecords = bankRecords.filter(br => {
    // Special case of MBBank having only "transaction amount" instead of dividing into outflow and inflow;
    if (bankType === Banks.vietinBank) {
      const amount = br['Số tiền GD'];
      br['Ghi có'] = amount > 0 ? amount : 0;
      br['Ghi nợ'] = amount < 0 ? Math.abs(amount) : 0;
      delete br['Số tiền GD']
    }
    const correctRecordPropertyStart = Object.keys(br).find(k => markedAsStartString.includes(k.toLowerCase()));
    if (correctRecordPropertyStart && isNaN(Number(br[correctRecordPropertyStart])) || !correctRecordPropertyStart) {
      return false;
    }
    return true
  })
  const schema = bankType ? bankSchema[bankType] : []
  const standardizedRecords = bankRecords.reduce((acc, br, i) => {
    schema.forEach((sch, schemaIndex) => {
      const { value, label } = sch;
      acc[i] = { ...(acc[i] || {}), [value]: br[label] }
    })
    return acc
  }, [])
  return { bankRecords, bankType, bankHeaders, standardizedRecords, }
}

export default standardizeBankData