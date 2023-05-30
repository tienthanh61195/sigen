export default function generateCombinations(
	arr: any[],
	index = 0,
	current: any[] = [],
	combinations: any[] = []
): any {
	if (index === arr.length) {
		combinations.push(current);
		return;
	}

	const innerArray = arr[index];

	for (let i = 0; i < innerArray.length; i++) {
		const element = innerArray[i];
		generateCombinations(arr, index + 1, [...current, element], combinations);
	}

	return combinations;
}
