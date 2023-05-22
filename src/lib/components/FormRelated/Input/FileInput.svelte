<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { ButtonTypes } from '$lib/constants/buttonTypes';
	import type { InputChangeEventHandler } from '$lib/types/events';
	import type {
		InputComponentChangeHandler,
		InputPropsForInputComponents
	} from '$lib/types/input-component';

	// type $$Props = InputPropsForInputComponents;
	export let value: (File | Blob)[] = [];
	export let label: string | undefined = '';
	let className: string | undefined = undefined;
	export { className as class };
	export let onChange: InputComponentChangeHandler | undefined = undefined;
	export let name = '';
	const onInputChange: InputChangeEventHandler = (e) => {
		value = e.currentTarget.files;
		onChange?.(e.currentTarget.files, e);
	};
	let inputRef: HTMLInputElement;
	const onBrowse = () => {
		inputRef.click();
	};
</script>

<input
	multiple
	bind:this={inputRef}
	on:focusout
	on:focus
	on:blur
	type="file"
	data-input-focusable
	data-as-file={true}
	placeholder={label}
	{name}
	on:change={onInputChange}
	class={className}
	style="display: none"
/>
<div class="w-full">
	<Button type="button" class="w-full" buttonType={ButtonTypes.CANCEL} on:click={onBrowse}
		>Browse...</Button
	>
	{#if value?.length}
		<div>
			{#each value as val}
				<div>{val.name}</div>
			{/each}
		</div>
	{/if}
</div>
