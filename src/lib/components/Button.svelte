<script lang="ts">
	import { ButtonTypes } from '../constants/buttonTypes';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	let className = '';
	export { className as class };
	export let buttonType: ButtonTypes = ButtonTypes.DEFAULT;
	export let disabled = false;

	type $$Props = Partial<
		HTMLButtonAttributes & {
			disabled: boolean;
			class: string;
			buttonType: ButtonTypes;
		}
	>;

	let classNameByButtonTypes = '';
	$: {
		switch (buttonType) {
			case ButtonTypes.PRIMARY:
				classNameByButtonTypes = 'bg-btn-primary text-white';
				break;
			case ButtonTypes.SECONDARY:
				classNameByButtonTypes = 'bg-general-active text-white';
				break;
			case ButtonTypes.CANCEL:
				classNameByButtonTypes = 'bg-btn-cancel text-white';
				break;
			case ButtonTypes.DISABLED:
				classNameByButtonTypes = 'bg-gray-200 text-placeholder';
				break;
			case ButtonTypes.TEXT_ONLY:
				classNameByButtonTypes = 'bg-transparent border-transparent';
				break;
			case ButtonTypes.DANGER:
				classNameByButtonTypes = 'text-white bg-danger border-transparent';
				break;
			case ButtonTypes.BORDER:
				classNameByButtonTypes = 'bg-transparent border border-main-blue text-main-blue';
				break;
			default:
				break;
		}
	}
</script>

<button
	{disabled}
	class="outline-none text-base flex items-center justify-center rounded px-6 py-3 leading-[0.9] {buttonType ===
	ButtonTypes.DISABLED
		? ''
		: 'hover:opacity-70'} {classNameByButtonTypes} {className}"
	on:click
	{...$$restProps}
>
	<slot />
</button>
