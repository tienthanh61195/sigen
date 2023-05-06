<script context="module">
	import { browser } from '$app/environment';

	const bodyOnClick = () => {
		if (!browser) return;
		document.body.classList.add('input-autofill-handle');
		document.removeEventListener('click', bodyOnClick);
	};
	if (browser) document.addEventListener('click', bodyOnClick);
	export const inputContext = 'custom_input_handler';
</script>

<script lang="ts">
	import LABEL_POSITIONS from '$lib/constants/labelPositions';
	import { onMount, setContext } from 'svelte';
	import { commonInputSpacing } from './Input.svelte';
	export let disabled = false;
	export let id: string | undefined = undefined;
	export let label: string | undefined = undefined;
	export let value: any;
	export let labelPosition: LABEL_POSITIONS;
	export let labelClassName: string | undefined = '';
	export let inputClassName: string | undefined = '';
	export let error: string | undefined = '';
	export let isTouched = false;
	// Change <div> container's classnames based on the position set for different label position to style for those positions
	export let inputContainerClasName: string | undefined = '';
	let originInputContainerClasName = '';

	let isInputFocused = false;
	setContext(inputContext, {
		focus() {
			isInputFocused = true;
		},
		blur() {
			isInputFocused = false;
		}
	});

	$: {
		switch (labelPosition) {
			case LABEL_POSITIONS.TOP:
				originInputContainerClasName = 'has-label-top';
				break;
			case LABEL_POSITIONS.BOTTOM:
				originInputContainerClasName = 'has-label-bottom';
				break;
			case LABEL_POSITIONS.LEFT:
				originInputContainerClasName = 'has-label-left';
				break;
			case LABEL_POSITIONS.RIGHT:
				originInputContainerClasName = 'has-label-right';
				break;
			case LABEL_POSITIONS.INNER:
				originInputContainerClasName = 'has-label-inner';
				break;
			case LABEL_POSITIONS.TOP_OVERRIDE:
				originInputContainerClasName = 'has-label-top-override';
				break;
			default:
				break;
		}
		if (value) originInputContainerClasName = `${originInputContainerClasName} not-empty`;
	}
	let labelRef: HTMLDivElement;
	let labelBgColor = '';
	onMount(() => {
		let labelAncestorNode = labelRef.parentElement;
		while (1) {
			if (!labelAncestorNode) break;
			const style = window.getComputedStyle(labelAncestorNode);
			const bgColor = style.getPropertyValue('background-color');
			const isBgTransparent = bgColor === `rgba(0, 0, 0, 0)` || bgColor === 'transparent';
			if (isBgTransparent) {
				labelAncestorNode = labelAncestorNode.parentElement;
				continue;
			}
			labelBgColor = bgColor;
			break;
		}
	});
</script>

<div class={`${inputContainerClasName} input-outer-container`}>
	<div
		style={`--commonInputSpacing: ${commonInputSpacing}`}
		class={`input-container ${originInputContainerClasName}`}
		class:focus-within={isInputFocused}
		class:disabled
	>
		<div class={`input ${inputClassName}`}>
			<div class="input-border-placeholder" />
			<div
				class:hidden={!isTouched || !error}
				class="input-error-border-placeholder"
				data-input-invalid={!!error}
			/>
			<slot />
		</div>
		<div class="label !leading-[0.93]" bind:this={labelRef} style:--labelBgColor={labelBgColor}>
			<label class={labelClassName} for={id}>{label}</label>
		</div>
	</div>
	<div class:hidden={!isTouched} class="error" data-input-invalid={!!error}>
		{error}
	</div>
</div>

<style lang="scss">
	.input-outer-container {
		.input-container {
			& > :global(*) {
				width: 100%;
			}
			& :global(input:-webkit-autofill) {
				-webkit-box-shadow: 0 0 0 50px white inset;
				/* Change the color to your own background color */
				-webkit-text-fill-color: #333;
			}
			& :global(input:-webkit-autofill:focus) {
				-webkit-box-shadow: 0 0 0 50px white inset;
				/*your box-shadow*/
				-webkit-text-fill-color: #333;
			}
			& > :global(*) {
				@apply duration-150 flex;
			}
			& :global(textarea::placeholder),
			& :global(input::placeholder) {
				opacity: 0;
			}
			& > .input {
				& .input-border-placeholder,
				& .input-error-border-placeholder {
					@apply bg-transparent border border-input w-full h-full absolute rounded transition-colors z-10 pointer-events-none;
				}
				& .input-error-border-placeholder {
					@apply z-10 pointer-events-none;
				}
			}
			&:focus-within > .input,
			&.focus-within > .input {
				& .input-border-placeholder,
				& .input-error-border-placeholder {
					@apply bg-transparent border-2 border-main-blue w-full h-full absolute;
				}
				& .input-error-border-placeholder {
					@apply z-10;
				}
			}
			& :global(textarea),
			& :global(input),
			& :global(.input-substitution),
			& :global(.input-substitution > .placeholder-substitution) {
				padding: var(--commonInputSpacing);
				@apply w-full inset-0 outline-none bg-transparent;
			}
			&.disabled :global(textarea),
			&.disabled :global(input),
			&.disabled :global(.input-substitution),
			&.disabled :global(.input-substitution > .placeholder-substitution) {
				@apply cursor-not-allowed bg-disabled;
			}

			& .label {
				transition-property: colors, top, padding, opacity;
				display: flex;
				width: auto;
				max-width: 100%;
			}

			&.has-label-top {
				@apply flex flex-col;
				& > .input {
					@apply order-2;
				}
				& > .label {
					@apply order-1 mb-1;
				}
			}

			&.has-label-bottom {
				@apply flex flex-col;
				& > .label {
					@apply mt-1;
				}
			}

			&.has-label-left {
				@apply flex;
				& > .input {
					@apply order-2;
				}
				& > .label {
					@apply order-1 items-center mr-3;
				}
			}

			&.has-label-right {
				@apply flex;
				& > .label {
					@apply order-1 items-center ml-3;
				}
			}

			&.has-label-inner {
				& > .label {
					@apply opacity-50 origin-left absolute top-1/2 left-0 -translate-y-1/2;
					padding: var(--commonInputSpacing);
				}
				&:focus-within,
				&.not-empty,
				&.focus-within {
					& > .label {
						@apply text-xs opacity-40 translate-y-0 top-0 py-0;
					}
				}
			}

			&.has-label-top-override {
				& :global(textarea::placeholder),
				& :global(input::placeholder) {
					opacity: 1;
				}
				& > .label {
					@apply text-placeholder origin-left absolute top-1/2 left-0 -translate-y-1/2 z-20 pointer-events-none;
					padding-top: var(--commonInputSpacing);
					padding-bottom: var(--commonInputSpacing);
					margin-left: calc(var(--commonInputSpacing) - 3px);
					margin-right: calc(var(--commonInputSpacing) - 3px);
					padding-left: 3px;
					padding-right: 3px;
					max-width: calc(100% - var(--commonInputSpacing) - 4px);
				}
				&:focus-within,
				&.focus-within {
					& > .label {
						@apply text-sm -translate-y-1/2 top-0 py-0 text-main-blue mb-1;
						background-color: var(--labelBgColor);
					}
				}
				&.not-empty {
					& > .label {
						@apply text-sm -translate-y-1/2 top-0 py-0 block;
						background-color: var(--labelBgColor);
						opacity: 100% !important;
					}
				}
			}
		}

		.error {
			@apply text-red-500;
		}
		.input-error-border-placeholder {
			@apply border-red-500 #{!important};
		}
	}
</style>
