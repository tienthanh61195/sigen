import * as pdfjsLib from 'pdfjs-dist';
import workersrc from 'pdfjs-dist/build/pdf.worker';
const GlobalWorkerOptions = pdfjsLib.GlobalWorkerOptions || pdfjsLib.default.GlobalWorkerOptions
const getDocument = pdfjsLib.getDocument || pdfjsLib.default.getDocument
GlobalWorkerOptions.workerSrc = workersrc;

const readFile = async (typedarray: any) => {
	const pdfDoc = await getDocument({
		disableFontFace: false,
		fontExtraProperties: true,
		data: typedarray
	}).promise;
	const numPages = pdfDoc.numPages;
	// Loop through each page in the PDF
	// for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
	const stringPerPage = {};
	const stringPropertyPerPage = [];
	const contentDetailPerPage = {};
	const pages = {};
	for (let pageNum = 1; pageNum <= numPages; pageNum++) {
		let string = '';
		const stringProperty = {};
		const pageData = await pdfDoc.getPage(pageNum);
		pages[pageNum] = pageData;
		const textContent = await pageData.getTextContent();
		contentDetailPerPage[pageNum] = (contentDetailPerPage[pageNum] || []).concat(textContent);

		textContent.items.forEach((i) => {
			if (!i.hasEOL) {
				string = string + i.str;
			} else {
				string = string + i.str.replace(/\n/g, ' ') + '\n';
			}
		});
		stringPerPage[`${pageNum}`] = string;
		stringPropertyPerPage[pageNum] = stringProperty;
	}
	return {
		stringPerPage,
		pages,
		contentDetailPerPage
	};
};

export default async function readPdfFile(file: any, cb?: any) {
	// Initialize PDF.js
	const fileReader = new FileReader();
	fileReader.onload = async function () {
		let typedarray: any = null;
		if (this.result && typeof this.result !== 'string') typedarray = new Uint8Array(this.result);
		if (!typedarray) return;
		const texts = await readFile(typedarray);
		cb?.(texts);
	};
	fileReader.readAsArrayBuffer(file);
}
