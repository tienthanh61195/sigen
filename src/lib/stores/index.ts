import { derived, writable, type Writable } from 'svelte/store';
import messages from '../intl/messages.json';
import { persistStore } from './helpers';
import type { GeneralFunction } from '$lib/types/common';
import type { InputOption } from '$lib/types/input-component';

export const langMessageStore = writable<keyof typeof messages>('en');
export const messagesStore = derived(langMessageStore, ($lang) => messages[$lang]);

export const contractExportStore = persistStore('contractExport', {
	templates: {} as Record<string, any>,
	data: {} as Record<string, any>,
	links: {} as Record<string, any>,
	vat: 0,
	generateContractInput: {} as Record<string, any>
});

export const financeReportStore = persistStore<{ credit: any[]; debit: any[] }>('financeReport', {
	credit: [],
	debit: []
});

export const gptArticleGenerateStore = persistStore<{
	dataByColumnLabel: Record<string, InputOption[]>;
	columns: { id: string; label: string; active: boolean }[];
	gptAnswers: Record<string, string>;
	gptToken: string;
	activeColumns: Record<string, boolean>;
	columnsPreset: { id: string; label: string; active: boolean }[][];
}>('gptArticle', {
	dataByColumnLabel: {},
	columns: [],
	gptAnswers: {},
	gptToken: '',
	activeColumns: {},
	columnsPreset: []
});
