<script lang="ts">
	import type { InputChangeEventHandler } from '$lib/types/events';
	import type {
		InputComponentChangeHandler,
		InputPropsForInputComponents
	} from '$lib/types/input-component';
	// import type { ChangeEventHandler } from 'svelte/elements';
	type $$Props = InputPropsForInputComponents;
	export let value: string | undefined = undefined;
	export let label: string | undefined = '';
	let className: string | undefined = undefined;
	export { className as class };
	export let onChange: InputComponentChangeHandler | undefined = undefined;
	export let name = '';

	const onInputChange: InputChangeEventHandler = (e) => {
		onChange?.(e.currentTarget.value, e);
	};
</script>

<input
	data-input-focusable
	on:focusout
	on:focus
	on:blur
	placeholder={label}
	{name}
	{value}
	on:input={onInputChange}
	class={className}
/>
