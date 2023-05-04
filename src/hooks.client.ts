import windowSizesStore from '$lib/stores/windowSizes';
let backdropElement = document.getElementById('svelte__backdrop');
if (!backdropElement) {
	backdropElement = document.createElement('div');
	document.body.appendChild(backdropElement);
}

backdropElement.setAttribute('id', 'svelte__backdrop');
backdropElement.style.position = 'absolute';
backdropElement.style.top = '0';
backdropElement.style.left = '0';

windowSizesStore.set({ height: window.innerHeight, width: window.innerWidth });
window.addEventListener('resize', () => {
	windowSizesStore.set({ height: window.innerHeight, width: window.innerWidth });
});
