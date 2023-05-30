<script lang="ts">
	import { ButtonTypes } from '$lib/constants/buttonTypes';
	import askGpt from '$lib/utils/askGpt';
	import generateCombinations from '$lib/utils/generateCombinations';
	import Button from '../Button.svelte';

	export let rows: Record<string, any>[];
	export let columns: { id: string; name: string }[];
	export let loading = false;
	let results = [];
	$: prompts = rows.map((r) => generateCombinations(columns.map((c) => r[c.id])));

	$: {
		console.log(prompts);
	}

	$: onAskGptClick = async () => {
		loading = true;
		const res = await Promise.all(
			prompts.reduce((acc, promptSet) => {
				acc.push(
					...promptSet?.map((prompt) => {
						const promptString = `Write ${prompt.join(' ')}`;
						return askGpt(promptString);
					})
				);
				return acc;
			}, [] as any[])
		);
		loading = false;
		results = res;
	};
</script>

<div>
	<div class="font-bold text-xl">Prompts:</div>
	{#each prompts as promptSet, index (index)}
		{#each promptSet as prompt, index}
			<div class="pl-2 py-1">
				Write {prompt.join(' ')}
			</div>
			{#if results[index]}
				<div class="ml-5 pb-3">
					Answer: {results[index]}
				</div>
			{/if}
		{/each}
	{/each}
	<Button disabled={loading} class="mt-4" buttonType={ButtonTypes.PRIMARY} on:click={onAskGptClick}>
		{loading ? 'ASKING...' : 'Ask GPT'}
	</Button>
</div>

<style lang="postcss">
</style>
