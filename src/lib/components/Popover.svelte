<script lang="ts">
	import type { GeneralFunction } from '$lib/types/common';
	import type { PopoverActiveBehaviourType, PopoverActivePositionType } from '$lib/types/popover';
	import getElementCoordsAndSizes from '$lib/utils/getElementCoordsAndSizes';
	import clickOutsideElement from '$lib/utils/svelte-actions/clickOutsideElement';
	// import onKeyDown from '$lib/utils/svelte-actions/onKeyDown';
	import { onDestroy, onMount } from 'svelte';
	import Backdrop from './Backdrop.svelte';
	import windowSizesStore from '$lib/stores/windowSizes';
	export let visible = false;
	export let contentClassNameOnPopoverVisible = '';
	export let contentClassName = '';
	export let onClosePopover: GeneralFunction | undefined = undefined;
	$: visibleState = visible;

	interface $$Slots {
		popoverContent: any;
		default: any;
	}
	export let behaviour: PopoverActiveBehaviourType = 'click';
	export let position: PopoverActivePositionType = 'right';
	export let backdropVisible = true;
	export let destroyOnClose = false;
	let coordX: number;
	let coordY: number;
	let contentRef: HTMLElement;
	let popoverRef: HTMLElement;
	$: contentCoord = getElementCoordsAndSizes(contentRef);
	$: popoverCoord = getElementCoordsAndSizes(popoverRef);
	let shouldReversePopoverVertically = false;
	let shouldReversePopoverHorizontally = false;
	let popoverArrowCoordTop: string;
	$: {
		// if (position.includes('bottom')) {
		// 	shouldReversePopoverVertically =
		// 		contentCoord.top + contentCoord.height + popoverCoord.height >
		// 		$windowSizesStore.height - 100;
		// } else if (position.includes('top')) {
		// 	shouldReversePopoverVertically = contentCoord.top - popoverCoord.height < 50;
		// } else {
		// }
	}
	$: onPreClosePopover = () => {
		onClosePopover?.();
	};
	$: {
		if (position.includes('right')) {
			shouldReversePopoverHorizontally =
				contentCoord.left + contentCoord.width + popoverCoord.width > $windowSizesStore.width - 100;
		} else if (position.includes('left')) {
			shouldReversePopoverHorizontally = contentCoord.left - popoverCoord.width < 50;
		}
	}
	$: translateY =
		shouldReversePopoverVertically && position === 'adaptive' ? 'calc(-100% + 30px)' : '0';
	$: translateX =
		shouldReversePopoverHorizontally && position === 'adaptive' ? 'calc(-100% - 15px)' : '0';

	$: switchVisibleStateFactory = (newVisibleState: boolean) => {
		return () => {
			const newContentCoord = getElementCoordsAndSizes(contentRef);
			// if (!isEqual(newContentCoord, contentCoord)) contentCoord = newContentCoord;
			if (!newVisibleState) onPreClosePopover();
			if (!newVisibleState || newVisibleState) visibleState = newVisibleState;
		};
	};

	$: onHoverInContent = behaviour === 'hover' ? switchVisibleStateFactory(true) : undefined;
	$: onHoverOutContent = behaviour === 'hover' ? switchVisibleStateFactory(false) : undefined;
	$: onMouseMoveInsideContent =
		position === 'adaptive'
			? (e: MouseEvent) => {
					coordX = e.clientX + 10;
					coordY = e.clientY - 20;
			  }
			: undefined;
	$: onClickContent = behaviour === 'click' ? switchVisibleStateFactory(true) : undefined;
	$: onClickOutsideContent = behaviour === 'click' ? switchVisibleStateFactory(false) : undefined;

	$: {
		if (visibleState) {
			const tempContentCoord = getElementCoordsAndSizes(contentRef);
			const tempPopoverCoord = getElementCoordsAndSizes(popoverRef);

			let tempCoordY;
			switch (position) {
				case 'right':
					coordX = shouldReversePopoverHorizontally
						? tempContentCoord.left - 10
						: tempContentCoord.left + tempContentCoord.width + 10;
					tempCoordY =
						tempContentCoord.top + tempContentCoord.height / 2 - tempPopoverCoord.height / 2;
					if (tempCoordY < 0) {
						coordY = tempContentCoord.top;
						popoverArrowCoordTop = `${tempContentCoord.height / 2}px`;
					} else if (tempCoordY + tempPopoverCoord.height > $windowSizesStore.height) {
						coordY = tempContentCoord.top + tempContentCoord.height - tempPopoverCoord.height;
						popoverArrowCoordTop = `${tempPopoverCoord.height - tempContentCoord.height / 2}px`;
					} else {
						popoverArrowCoordTop = '50%';
						coordY = tempCoordY;
					}

					translateY = '0';
					translateX = shouldReversePopoverHorizontally ? '-100%' : '0';
					break;
				case 'left':
					coordX = shouldReversePopoverHorizontally
						? tempContentCoord.left + tempContentCoord.width + 10
						: tempContentCoord.left - 10;
					tempCoordY =
						tempContentCoord.top + tempContentCoord.height / 2 - tempPopoverCoord.height / 2;
					popoverArrowCoordTop = `${tempContentCoord.top + tempContentCoord.height / 2}px`;
					if (tempCoordY < 0) {
						coordY = tempContentCoord.top + tempContentCoord.height / 2;
					} else if (tempCoordY + tempPopoverCoord.height > $windowSizesStore.height - 50) {
						coordY = tempContentCoord.top + tempContentCoord.height - tempPopoverCoord.height;
					} else {
						popoverArrowCoordTop = '50%';
						coordY = tempCoordY;
					}
					translateY = '0';
					translateX = '-100%';
				case 'bottom':
					shouldReversePopoverHorizontally =
						tempContentCoord.left + tempPopoverCoord.width > $windowSizesStore.width - 50;
					shouldReversePopoverVertically =
						tempContentCoord.top + tempContentCoord.height + tempPopoverCoord.height >
						$windowSizesStore.height - 100;
					coordX = shouldReversePopoverHorizontally
						? tempContentCoord.left + tempContentCoord.width - tempPopoverCoord.width
						: tempContentCoord.left;
					tempCoordY = tempContentCoord.top + tempContentCoord.height + 5;
					popoverArrowCoordTop = `${tempContentCoord.top + tempContentCoord.height / 2}px`;
					if (tempCoordY + tempPopoverCoord.height > $windowSizesStore.height - 50) {
						coordY = tempContentCoord.top - 5 - popoverCoord.height;
					} else {
						popoverArrowCoordTop = '50%';
						coordY = tempCoordY;
					}
				case 'top':
					shouldReversePopoverVertically = tempContentCoord.top - tempPopoverCoord.height < 50;
				default:
					break;
			}
		}
	}

	$: onKeyEscPressHandler = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && visibleState) {
			visibleState = false;
		}
	};

	onMount(async () => {
		contentCoord = getElementCoordsAndSizes(contentRef);
		document.addEventListener('keydown', onKeyEscPressHandler);
	});
	onDestroy(() => {
		document.removeEventListener('keydown', onKeyEscPressHandler);
	});

	$: {
		// console.log('test checking', contentCoord, popoverCoord);
	}
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	bind:this={contentRef}
	class="w-full h-full border-inherit bg-inherit {contentClassName} {visibleState
		? contentClassNameOnPopoverVisible
		: ''}"
	on:mouseenter={onHoverInContent}
	on:mousemove={onMouseMoveInsideContent}
	on:mouseleave={onHoverOutContent}
	on:click={onClickContent}
>
	<slot />
</div>
{#if $$slots.popoverContent && (!destroyOnClose || (destroyOnClose && visibleState))}
	<Backdrop {destroyOnClose} {backdropVisible} visible={visibleState && !!coordX && !!coordY}>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- <div
			class="w-auto h-auto border-inherit bg-inherit z-10 absolute bg-white {contentClassName} {visibleState
				? contentClassNameOnPopoverVisible
				: ''}"
			style="top:{contentCoord.top}px;left:{contentCoord.left}px;width:{contentCoord.width}px;height:{contentCoord.height}px"
			on:mouseenter={onHoverInContent}
			on:mousemove={onMouseMoveInsideContent}
			on:mouseleave={onHoverOutContent}
			on:click={onClickContent}
		>
			<slot />
		</div> -->
		<div
			use:clickOutsideElement
			on:outclick={onClickOutsideContent}
			class:arrow-left={(!shouldReversePopoverHorizontally && position === 'right') ||
				(shouldReversePopoverHorizontally && position === 'left')}
			class:arrow-right={(!shouldReversePopoverHorizontally && position === 'left') ||
				(shouldReversePopoverHorizontally && position === 'right')}
			class="popover-content {shouldReversePopoverHorizontally
				? '-translate-x-full'
				: ''} {shouldReversePopoverVertically ? '-translate-y-full' : ''}"
			style="top:{coordY}px;left:{coordX}px;transform: translate({translateX},{translateY});--arrowTop: {popoverArrowCoordTop}"
			bind:this={popoverRef}
		>
			<slot name="popoverContent" />
		</div>
	</Backdrop>
{/if}

<style lang="scss">
	.popover-content {
		@apply absolute;
		box-shadow: 0 4px 5px -5px lightgrey;
		& > :global(:first-child)::before {
			position: absolute;
			transition: none;
			width: 10px;
			height: 10px;
			background-color: inherit;
			border: inherit;
			border-bottom: none;
			border-right: none;
			content: '';
			z-index: -1;
			border-width: 1px;
			border-style: solid;
			border-color: inherit;
		}
		& > :global(:first-child)::after {
			position: absolute;
			transition: none;
			width: 1px;
			height: 12px;
			background-color: inherit;
			border: none;
			content: '';
			z-index: 3;
		}
		&.arrow-right > :global(:first-child) {
			&::before {
				top: var(--arrowTop);
				left: 100%;
				transform: translate(calc(-50% + 1px), -50%) rotate(45deg);
				border-bottom: 0;
				border-left: 0;
			}
			&::after {
				top: var(--arrowTop);
				left: 100%;
				transform: translateY(-50%);
			}
		}
		&.arrow-left > :global(:first-child) {
			&::before {
				top: var(--arrowTop);
				left: 0;
				transform: translate(calc(-50% - 1px), -50%) rotate(45deg);
				border-top: 0;
				border-right: 0;
			}
			&::after {
				top: var(--arrowTop);
				left: -1px;
				transform: translateY(-50%);
			}
		}
	}
</style>
