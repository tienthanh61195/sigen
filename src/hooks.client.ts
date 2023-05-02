import windowSizesStore from "$lib/stores/windowSizes"
let backdropElement = document.getElementById('svelte__backdrop');
if (!backdropElement) {
  backdropElement = document.createElement('div');
  backdropElement.setAttribute('id', 'svelte__backdrop');
  document.body.appendChild(backdropElement);
}


windowSizesStore.set({ height: window.innerHeight, width: window.innerWidth })
window.addEventListener('resize', () => {
  windowSizesStore.set({ height: window.innerHeight, width: window.innerWidth })
})