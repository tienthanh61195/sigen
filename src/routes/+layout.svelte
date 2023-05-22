<!-- svelte-ignore a11y-click-events-have-key-events -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import ssvLogo from '$lib/images/ssv-logo.png';
	import { base } from '$app/paths';
	import '../app.css';
	import { page } from '$app/stores';
	const menuNavigations = [
		{ label: 'Phân Loại Tài Chính', route: `${base}/financial-report` },
		{ label: 'Xuất Giấy Tờ', route: `${base}/contract-generate` }
	];
	const onNavigationClick = (route: string) => {
		goto(route);
	};
	$: selectedRoute = menuNavigations.find(({ route }) => route.includes($page.url.pathname));
	$: header = selectedRoute?.label || 'Survival Skill Vietnam';
</script>

<svelte:head>
	<title>{header}</title>
</svelte:head>
<div class="main">
	<div class="main__header">
		<div class="flex text-lg p-3 flex-row h-full items-center border-r border-r-white">
			<img src={ssvLogo} />
			<div class="ml-2">Survival Skills Vietnam</div>
		</div>
		<div class="flex text-lg flex-1 self-stretch gap-10 ml-2">
			{#each menuNavigations as menuNavigation (menuNavigation.label)}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					on:click={() => {
						onNavigationClick(menuNavigation.route);
					}}
					class="cursor-pointer hover:opacity-80 items-center flex p-2 {selectedRoute?.label ===
					menuNavigation.label
						? 'text-[#E88F1A] font-semibold'
						: ''}"
				>
					{menuNavigation.label}
				</div>
			{/each}
		</div>
	</div>
	<div class="main__body">
		<slot />
	</div>
	<div class="main__footer">&#169; 2018 Survival Skill Vietnam</div>
</div>

<style lang="scss">
	.main {
		@apply w-screen h-screen overflow-hidden flex flex-col;
		& .main__header {
			@apply h-14 flex overflow-hidden items-center bg-gradient-to-r from-blue-600 to-blue-500 text-white;
			& img {
				height: 100%;
				width: auto;
			}
		}
		& .main__body {
			@apply flex-1 overflow-hidden;
		}

		& .main__footer {
			@apply flex items-center justify-center p-2 text-gray-500 border-t border-t-gray-300;
		}
	}
</style>
