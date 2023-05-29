import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import PizZip from 'pizzip';

export default function readDocFile(result: string | ArrayBuffer) {
	const zip = new PizZip(result);
	const doc = new Docxtemplater(zip, {
		paragraphLoop: true,
		linebreaks: true
	});
	const saveDocFile = (doc: Docxtemplater<PizZip>, filename: string) => {
		const blob = doc.getZip().generate({
			type: 'blob',
			mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			// compression: DEFLATE adds a compression step.
			// For a 50MB output document, expect 500ms additional CPU time
			compression: 'DEFLATE'
		});
		saveAs(blob, `new-${filename}`);
	};
	return { doc, saveDocFile };
}
