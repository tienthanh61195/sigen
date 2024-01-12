<script lang="ts">
	import pdfjsLib from 'pdfjs-dist';
	import '../app.css';
	import readPdfFile from '$lib/utils/readPdfFile';
	import isEmpty from 'lodash/isEmpty';
	import union from 'lodash/union';

	function convertToCanvasCoords({ x, y, width, height, scale, canvasHeight }: any) {
		return [x * scale, canvasHeight - (y + height) * scale, width * scale, height * scale];
	}

	let filters = [
		'Hố ga',
		'Hố thu',
		'Hố thăm',
		'Hầm ga',
		'Kênh',
		'Cống',
		'Thải',
		' Rác',
		'Muỗi',
		'Mùi',
		' Hôi',
		'Thu nước',
		'Thoát nước',
		'Vận chuyển',
		'Nâng',
		' Hạ',
		'Trộn',
		'Lọc',
		'Song chắn'
	];
	let pdfJsPagesAndStrings: any = {};
	$: pdfStringsByPage = pdfJsPagesAndStrings?.stringPerPage;
	$: pdfPages = pdfJsPagesAndStrings?.pages || {};
	const onInputFile = (e: any) => {
		const file = e.target.files[0];
		readPdfFile(file, (obj: any) => {
			pdfJsPagesAndStrings = obj;
		});
	};
	let matchByPage: any = {};
	let matchByPageRef: any = [];
	$: {
		const matchedTemp: any = {};
		if (!isEmpty(pdfStringsByPage)) {
			Object.entries(pdfStringsByPage).forEach(([page, content]) => {
				filters.forEach((t) => {
					if (content.toLowerCase().includes(t.toLowerCase())) {
						matchedTemp[page] = (matchedTemp[page] || []).concat(pdfPages[page]);
					}
				});
			});
		}
		matchByPage = matchedTemp;
	}

	$: matchByPageRefAsArray = Object.keys(matchByPage || {});
	$: {
		if (matchByPageRefAsArray.length && matchByPageRef.length === matchByPageRefAsArray.length)
			setTimeout(() => {
				if (matchByPageRef.length === matchByPageRefAsArray.length) {
					matchByPageRefAsArray.forEach((pageNum) => {
						const page = pdfPages[pageNum];
						if (page) {
							const scale = 1.5;
							const viewport = page.getViewport({ scale });
							//
							// Prepare canvas using PDF page dimensions
							//
							const canvas: any = document.getElementById(`canvas-${pageNum}`);
							const context = canvas?.getContext('2d');
							canvas.height = viewport.height;
							canvas.width = viewport.width;
							const task = page.render({ canvasContext: context, viewport: viewport });

							task.promise.then(function () {
								// console.log(canvas.toDataURL('image/jpeg'));
								const content = pdfJsPagesAndStrings.contentDetailPerPage[pageNum];
								console.log(content?.[0]?.items);
								content?.[0]?.items?.forEach((ct) => {
									let matched = '';
									if (
										filters.some((f) => {
											if (ct.str.toLowerCase().includes(f.toLowerCase())) {
												matched = f;
												return true;
											}
											return false;
										})
									) {
										console.log(pageNum, ct.str, matched);
										const { transform, width, height } = ct;
										const x = transform[4];
										const y = transform[5];
										context.strokeStyle = 'red';
										context.lineWidth = 2;

										context.strokeRect(
											...convertToCanvasCoords({
												x,
												y,
												width,
												height,
												scale,
												canvasHeight: viewport.height
											})
										);
									}
								});
							});
						}
					});
				}
			}, 500);
	}
</script>

<div class="p-4">
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label>Select File:</label>
	<input type="file" on:change={onInputFile} />
	<div class="my-4">
		Filters: <input
			on:keypress={(e) => {
				if (e.key === 'Enter') {
					filters = union(filters, [e.target?.value]);
				}
			}}
			class="border border-gray-400 active:border-gray-700 focus-visible:border-gray-700 outline-none p-2 rounded-md"
		/>
	</div>
	<div class="flex gap-2 flex-wrap">
		{#each filters as t, i (t)}
			<div class="flex p-2 rounded-sm border border-gray-600">
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="text-red-500 scale-110 pr-2 cursor-pointer"
					on:click={() => {
						filters = filters.filter((f) => f !== t);
					}}
				>
					x
				</div>
				<span>{t}</span>
			</div>
		{/each}
	</div>
	<div class="my-3">
		Matched pages:
		{#each matchByPageRefAsArray as canvas, i}
			<span>{canvas}{i < matchByPageRefAsArray.length - 1 ? ' - ' : ''}</span>
		{/each}
	</div>
	{#each matchByPageRefAsArray as canvas, i}
		<div>
			<span class="font-bold inline-block my-2">Page {canvas}</span>
			<canvas bind:this={matchByPageRef[i]} id="canvas-{canvas}" style="border:1px solid black" />
		</div>
	{/each}
	<!-- <slot /> -->
</div>
