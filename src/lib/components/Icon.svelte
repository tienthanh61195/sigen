<script lang="ts" context="module">
	// function stringLiterals<T extends string>(...args: T[]): T[] {
	// 	return args;
	// }
	// type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<infer ElementType>
	// 	? ElementType
	// 	: never;

	export type IconName =
		| 'keyboard_arrow_down'
		| 'keyboard_arrow_right'
		| 'keyboard_arrow_left'
		| 'keyboard_arrow_up'
		| 'keyboard_double_arrow_down'
		| 'keyboard_double_arrow_right'
		| 'keyboard_double_arrow_left'
		| 'keyboard_double_arrow_up'
		| 'add'
		| 'edit'
		| 'delete'
		| 'content_copy'
		| 'close'
		| 'check'
		| 'settings'
		| 'access_time'
		| 'task'
		| 'bar_chart'
		| 'manage_accounts';
</script>

<script lang="ts">
	let className = '';
	export let name: IconName;
	export { className as class };
	let iconClass = 'material-icons-outlined';
	// let iconValue = '';
	// $: {
	// 	iconValue = `${name}`;
	// }
</script>

<div
	{...$$restProps}
	on:click
	class={`min-w-6 w-auto items-center cursor-pointer flex ${className} ${iconClass}`}
>
	{name}
</div>
