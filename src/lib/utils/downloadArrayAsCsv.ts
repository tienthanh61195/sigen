export default function downloadArrayAsCsv(exportArray: string[][], exportName: string) {
	const dataStr = 'data:text/json;charset=utf-8,' + exportArray.map((e) => e.join(',')).join('\n');
	const downloadAnchorNode = document.createElement('a');
	downloadAnchorNode.setAttribute('href', dataStr);
	downloadAnchorNode.setAttribute('download', exportName + '.csv');
	document.body.appendChild(downloadAnchorNode); // required for firefox
	downloadAnchorNode.click();
	downloadAnchorNode.remove();
}
