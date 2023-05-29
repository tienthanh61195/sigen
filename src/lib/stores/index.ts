import { derived, writable, type Writable } from 'svelte/store';
import messages from '../intl/messages.json';
import { persistStore } from './helpers';
import type { GeneralFunction } from '$lib/types/common';

export const langMessageStore = writable<keyof typeof messages>('en');
export const messagesStore = derived(langMessageStore, ($lang) => messages[$lang]);

export const contractExportStore = persistStore('contractExport', {
	templates: {} as Record<string, any>,
	data: {} as Record<string, any>,
	links: {} as Record<string, any>,
	vat: 0,
	generateContractInput: {}
});

export const financeReportStore = persistStore<{ credit: any[]; debit: any[] }>('financeReport', {
	credit: [],
	debit: []
});
