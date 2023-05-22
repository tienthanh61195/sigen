export function textToBinary(txt: string) {
	return txt
		.split('')
		.map(function (char) {
			return char.charCodeAt(0).toString(2);
		})
		.join(' ');
}
