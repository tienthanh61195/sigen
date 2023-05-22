<script lang="ts">
	import type { InputChangeEventHandler } from '$lib/types/events';
	import type { InputComponentChangeHandler } from '$lib/types/input-component';

	export let value: boolean | string | undefined = undefined;
	let className: string | undefined = undefined;
	export { className as class };
	export let onChange: InputComponentChangeHandler | undefined = undefined;
	export let name = '';
	const onInputChange = (e) => {
		onChange?.(e.target.checked, e);
	};
</script>

<input class={className} checked={!!value} type="checkbox" on:input={onInputChange} {name} />
