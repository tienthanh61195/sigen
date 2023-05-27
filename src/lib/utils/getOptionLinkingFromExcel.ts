import { isString } from 'lodash';
import { read } from 'xlsx';

export default async function getOptionLinkingFromExcel(file: Blob | File) {
	const excelFileData = read(await file.arrayBuffer());
	const sheetName = excelFileData.SheetNames[0];
	const sheetData = excelFileData.Sheets[sheetName];
	let initialRowNumber = 1;
	let initialColKey = '';
	const initialLinkPropertiesCellPosition: Record<string, any> = {};
	const columnsWithData: string[] = [];

	// const linkKeys =
	for (const cellPosition in sheetData) {
		if (!cellPosition.match(/[A-Z]+[0-9]+/g)) {
			continue;
		}
		const cellValue = sheetData[cellPosition].v.trim() as string;
		const cellKey = cellPosition.match(/[A-Z]+/)?.[0];
		const cellNumber = cellPosition.match(/[0-9]+/)?.[0];
		if (!cellNumber || !cellKey) continue;
		let valueIndicatingLinkKey = isString(cellValue) ? cellValue?.match(/\{(.+|\s+)+\}/)?.[0] : '';
		if (valueIndicatingLinkKey) {
			if (!initialColKey || cellKey.charCodeAt(0) < initialColKey.charCodeAt(0)) {
				initialColKey = cellKey;
			}
			valueIndicatingLinkKey = valueIndicatingLinkKey.slice(1, -1);
			initialLinkPropertiesCellPosition[cellKey] = {
				propertyName: valueIndicatingLinkKey,
				column: cellKey,
				values: [],
				description: ''
			};
			columnsWithData.push(cellKey);
			initialRowNumber = Number(cellNumber) + 1;
		}
	}
	initialLinkPropertiesCellPosition[initialColKey].main = true;
	const mainProperty = initialLinkPropertiesCellPosition[initialColKey];

	for (const cellPosition in sheetData) {
		if (!cellPosition.match(/[A-Z]+[0-9]+/g)) {
			continue;
		}
		const cellValue = sheetData[cellPosition].v.trim() as string;
		const cellKey = cellPosition.match(/[A-Z]+/)?.[0];
		const cellNumber = cellPosition.match(/[0-9]+/)?.[0];
		if (
			!cellNumber ||
			!cellKey ||
			Number(cellNumber) < initialRowNumber ||
			!columnsWithData.includes(cellKey)
		)
			continue;
		if (Number(cellNumber) === initialRowNumber) {
			initialLinkPropertiesCellPosition[cellKey].description = cellValue;
			continue;
		}
		initialLinkPropertiesCellPosition[cellKey].values.push(cellValue);
	}
	const links = { [mainProperty.propertyName]: {} };
	const mainLink = links[mainProperty.propertyName];
	const mainPropertyValues = mainProperty.values;

	for (const cellKey in initialLinkPropertiesCellPosition) {
		if (cellKey === initialColKey) continue;
		const { propertyName, description, values } = initialLinkPropertiesCellPosition[cellKey];
		mainPropertyValues.forEach((mainPropertyVal, index) => {
			mainLink[mainPropertyVal] = mainLink[mainPropertyVal] || {};
			mainLink[mainPropertyVal][propertyName] = mainLink[mainPropertyVal][propertyName] || [];
			// mainLink[mainPropertyVal][propertyName].description = description;
			mainLink[mainPropertyVal][propertyName] = mainLink[mainPropertyVal][propertyName].concat({
				value: values[index],
				description: description
			});
		});
	}
	console.log(links);
	return links;
}
