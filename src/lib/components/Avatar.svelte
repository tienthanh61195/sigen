<script lang="ts">
	// export let style = ;
	const defaultStyle = { height: '100%' };
	export let src = '';
	export let style = '';
	let className = '';
	export { className as class };
</script>

<img
	style="height:{defaultStyle.height};aspect-ratio: 1/1; max-height: 100%; width: auto;{style}"
	class="logo border-gray-500 border rounded-[50%] bg-white {className}"
	alt="The project logo"
	src={src || 'https://picsum.photos/200'}
/>
