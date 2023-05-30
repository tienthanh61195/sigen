export default async function wait(ms: number) {
	return new Promise((res) => {
		setTimeout(() => {
			res('done');
		}, ms);
	});
}
