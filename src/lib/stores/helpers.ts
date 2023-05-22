import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';
export const sveltePersistedStoreName = 'svelte_persisted_store';

export const getPersistedValues = () => {
	if (!browser) return null;
	const items = localStorage.getItem(sveltePersistedStoreName);
	return items ? JSON.parse(items) : null;
};

export const persistedValues = getPersistedValues();

export default function writableCustom<T = unknown>(
	defaultValue: T
): Writable<T> & { reset: () => void } {
	const store = writable<T>(defaultValue);
	return {
		...store,
		reset: () => {
			store.set(defaultValue);
		}
	};
}

export function persistStore<T = unknown>(name: string, defaultValue: T): Writable<T> {
	const persistedValueByName = persistedValues?.[name] || defaultValue;
	const store = writableCustom<T>(persistedValueByName);
	store.subscribe((v) => {
		if (!browser) return;
		const items = getPersistedValues() || {};
		items[name] = v;
		localStorage.setItem(sveltePersistedStoreName, JSON.stringify(items));
	});
	return store;
}
