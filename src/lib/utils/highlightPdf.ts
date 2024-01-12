export default function renderHighlightAnnotations(page: any) {
	page.getAnnotations().then(function (annotations: any) {
		annotations.forEach(function (annotation: any) {
			if (annotation.subtype === 'Highlight') {
				const highlightRect = annotation.rect;
				const highlight = document.createElement('div');
				highlight.style.position = 'absolute';
				highlight.style.left = highlightRect[0] + 'px';
				highlight.style.top = highlightRect[1] + 'px';
				highlight.style.width = highlightRect[2] - highlightRect[0] + 'px';
				highlight.style.height = highlightRect[3] - highlightRect[1] + 'px';
				highlight.style.backgroundColor = 'yellow';
				highlight.style.opacity = '0.5';
				document.body.appendChild(highlight);
			}
		});
	});
}
