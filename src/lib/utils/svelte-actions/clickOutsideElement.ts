import { browser } from '$app/environment';

export default function clickOutsideElement(node: HTMLElement, txt?: string) {
	if (!browser) return;
	const handleClick = (event: MouseEvent) => {
		const target = event.target as Element;
		if (target && !node.contains(target)) {
			node.dispatchEvent(new CustomEvent('outclick', { detail: { event } }));
		}
	};

	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}
