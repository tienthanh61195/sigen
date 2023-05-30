<script lang="ts">
	import { ButtonTypes } from '$lib/constants/buttonTypes';
	import { gptArticleGenerateStore } from '$lib/stores';
	import askGpt from '$lib/utils/askGpt';
	import generateCombinations from '$lib/utils/generateCombinations';
	import { delay, isEmpty } from 'lodash';
	import Button from '../Button.svelte';
	import Icon from '../Icon.svelte';
	import wait from '$lib/utils/wait';

	export let row: Record<string, any>;
	export let columns: { id: string; name: string }[];
	export let loading = false;
	let timer = 0;
	$: prompts =
		columns.length && !isEmpty(row)
			? generateCombinations(
					columns.reduce((acc, c) => {
						if (row[c.id]) {
							acc.push(row[c.id]);
						}
						return acc;
					}, [] as any[])
			  )
			: [];

	$: onAskGptClick = async () => {
		if (!prompts?.length) return;
		loading = true;
		const results: Record<string, any> = {};
		const maxPerMin = 3;
		try {
			for (let i = 0; i <= prompts.length; i = i + maxPerMin) {
				const promptSet = prompts.slice(i, maxPerMin + i);
				await Promise.all([
					...promptSet.map(async (prompt: string[]) => {
						const promptString = `Write ${prompt.join(' ')}`;
						if ($gptArticleGenerateStore.gptAnswers[promptString]) return;
						const response = await askGpt({
							prompt: promptString,
							token: $gptArticleGenerateStore.gptToken
						});
						results[promptString] = response;
						gptArticleGenerateStore.update((c) => ({
							...c,
							gptAnswers: { ...c.gptAnswers, ...results }
						}));
						return;
					}),
					wait(70000)
				]);
			}
		} catch (err) {}
		loading = false;
	};
</script>

<div>
	<div class="overflow-auto max-h-">
		{#each prompts as prompt, index (index)}
			<div>
				<div class="px-2 py-1 border border-black">
					Write {prompt.join(' ')}
				</div>
				{#if $gptArticleGenerateStore.gptAnswers?.[`Write ${prompt.join(' ')}`]}
					<div class="pl-5 pb-2 border border-black border-t-0">
						<div class="font-bold flex gap-2 items-center py-2">
							Answer:<Icon
								class="active:text-general-active select-none"
								on:click={() => {
									navigator.clipboard.writeText(
										$gptArticleGenerateStore.gptAnswers[`Write ${prompt.join(' ')}`]
									);
								}}
								name="content_copy"
							/>
						</div>
						<div>{$gptArticleGenerateStore.gptAnswers[`Write ${prompt.join(' ')}`]}</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
	<Button
		disabled={loading}
		class="mt-4"
		buttonType={loading ? ButtonTypes.DISABLED : ButtonTypes.PRIMARY}
		on:click={onAskGptClick}
	>
		{loading ? 'ASKING...' : 'Ask GPT'}
	</Button>
</div>

<style lang="postcss">
</style>
