<script lang="ts">
	export let value: string | undefined = undefined;
	let className: string | undefined = undefined;
	export { className as class };
	export let onChange: (
		event: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => any | undefined;
</script>

<input {value} on:input={onChange} class={className} />
