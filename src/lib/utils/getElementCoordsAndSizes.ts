import { browser } from '$app/environment';

export type ElementCoordsAndSizesTypes = {
	top: number;
	left: number;
	width: number;
	height: number;
};

export default function getElementCoordsAndSizes(elem?: HTMLElement): ElementCoordsAndSizesTypes {
	// crossbrowser version
	if (!browser || !elem) return { top: 0, left: 0, width: 0, height: 0 };

	const box = elem.getBoundingClientRect();
	const body = document.body;
	const docEl = document.documentElement;

	const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
	const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

	const clientTop = docEl.clientTop || body.clientTop || 0;
	const clientLeft = docEl.clientLeft || body.clientLeft || 0;

	const top = box.top + scrollTop - clientTop;
	const left = box.left + scrollLeft - clientLeft;

	// return { top: Math.round(top), left: Math.round(left), width: box.width, height: box.height };
	return { top: box.top, left: box.left, width: box.width, height: box.height };
}
const a = 5;
const b = `23423${5}`;
