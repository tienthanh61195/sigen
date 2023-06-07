<script lang="ts">
	import { ButtonTypes } from '$lib/constants/buttonTypes';
	import { gptArticleGenerateStore } from '$lib/stores';
	import askGpt from '$lib/utils/askGpt';
	import generateCombinations from '$lib/utils/generateCombinations';
	import { delay, isEmpty } from 'lodash';
	import Button from '../Button.svelte';
	import Icon from '../Icon.svelte';
	import wait from '$lib/utils/wait';
	import downloadArrayAsCsv from '$lib/utils/downloadArrayAsCsv';
	import generateExcelFile from '$lib/utils/generateExcelFile';

	export let row: Record<string, any>;
	export let columns: { id: string; name: string }[];
	export let loading = false;
	let gptError = '';
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

	$: onExportResult = () => {
		if (!isEmpty($gptArticleGenerateStore.gptAnswers)) {
			const worksheet = Object.entries($gptArticleGenerateStore.gptAnswers).reduce(
				(acc, [prompt, response]) => {
					if (prompts.some((pr) => prompt === `Write ${pr.join(' ')}`)) {
						acc.push([prompt, response]);
					}
					return acc;
				},
				[] as any[]
			);
			worksheet.unshift(['Prompt', 'GPT Response']);
			// return;
			// console.log(resultAsArrays.map((e) => e.join(',')).join('\n'));
			generateExcelFile(worksheet, `gpt-generated-${new Date().toISOString()}`);
		}
	};
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
						let response;
						while (!response) {
							try {
								const res = await askGpt({
									prompt: promptString,
									token: $gptArticleGenerateStore.gptToken
								});
								response = res;
							} catch (err) {
								await wait(10000);
							}
						}

						results[promptString] = response;
						gptArticleGenerateStore.update((c) => ({
							...c,
							gptAnswers: { ...c.gptAnswers, ...results }
						}));
						return;
					})
				]);
			}
			const resultAsArrays = Object.entries(results).reduce((acc, [prompt, response]) => {
				acc.push([prompt, response]);
				return acc;
			}, [] as any[]);
			resultAsArrays.unshift(['Prompt', 'GPT Response']);
			// console.log(resultAsArrays.map((e) => e.join(',')).join('\n'));
			generateExcelFile(resultAsArrays, `gpt-generated-${new Date().toISOString()}`);
		} catch (err) {
			console.log('error', err);
			gptError = `Chờ xíu thử lại coi sao nha, lỗi gì rồi - ${err}`;
		} finally {
			loading = false;
		}
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
	<div class="flex gap-3">
		<div class="max-w-[50%]">
			<Button
				disabled={loading}
				class="mt-4"
				buttonType={loading ? ButtonTypes.DISABLED : ButtonTypes.PRIMARY}
				on:click={onAskGptClick}
			>
				{loading ? 'ASKING...' : 'Ask GPT'}
			</Button>
			{#if gptError}<div class="text-danger">{gptError}</div>{/if}
		</div>
		<div>
			<Button class="mt-4" buttonType={ButtonTypes.SECONDARY} on:click={onExportResult}>
				Export Results
			</Button>
		</div>
	</div>
</div>

<style lang="postcss">
</style>
