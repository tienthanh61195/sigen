<script lang="ts">
	import Backdrop from './Backdrop.svelte';
	import Icon from './Icon.svelte';
	import Modal from './Modal.svelte';
	import Popover from './Popover.svelte';
</script>

<Backdrop visible={true} backdropVisible={false}>
	<div class="notifications">
		<div class="notifications__container">
			<div class="notifications__container__content">Something something yeah yeah</div>
			<Icon name="close" class="text-base ml-2" />
		</div>
	</div>
</Backdrop>

<style lang="postcss">
	.notifications {
		@apply w-screen;
		& .notifications__container {
			@apply bg-white w-auto min-w-[100px] absolute left-[50%] -translate-x-1/2 top-2 p-2 rounded-default flex items-center justify-center;
			& .notifications__container__content {
			}
		}
	}
</style>
