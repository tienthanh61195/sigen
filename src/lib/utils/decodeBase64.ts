export default function decodeBase64(str: string) {
	return decodeURIComponent(escape(window.atob(str)));
}
