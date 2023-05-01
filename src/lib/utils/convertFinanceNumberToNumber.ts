import { isString } from "lodash";

const convertFinanceNumberToNumber = (str: string | number) => {
  if (!isString(str)) return str
  const number = str.replace(/,/gi, '');
  if (!isNaN(Number(number))) return Number(number);
  return str
}

export default convertFinanceNumberToNumber