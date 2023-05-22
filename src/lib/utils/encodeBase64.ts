export default function encodeBase64(str: string) {
	return window.btoa(unescape(encodeURIComponent(str)));
}
