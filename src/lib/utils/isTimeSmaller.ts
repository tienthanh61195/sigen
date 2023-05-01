export default function isTimeSmaller(time1: string, time2: string, separator = ':') {
	const time1Arr = time1.split(separator);
	const time2Arr = time2.split(separator);
	if (+time1Arr[0] < +time2Arr[0] || (+time1Arr[0] === +time2Arr[0] && +time1Arr[1] < +time2Arr[1]))
		return true;
	return false;
}
