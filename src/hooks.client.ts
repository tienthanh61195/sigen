let backdropElement = document.getElementById('svelte__backdrop');
if (!backdropElement) {
  backdropElement = document.createElement('div');
  backdropElement.setAttribute('id', 'svelte__backdrop');
  document.body.appendChild(backdropElement);
}