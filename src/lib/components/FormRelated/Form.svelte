<script context="module">
	let contextKey = 'customFormContextKey';
</script>

<script lang="ts">
	import type { GeneralFunction } from '$lib/types/common';

	import { setContext } from 'svelte';

	export let onSubmit: (param: { [key in string]: any }) => void;

	setContext(contextKey, {
		touchAllInputs: (func: GeneralFunction) => {
			func();
		}
	});

	const onSubmitForm = (e: Event) => {
		e.preventDefault();
		const formElement = e.target as HTMLFormElement;
		if (!formElement) return;
		const data = new FormData(formElement);
		const errorElement = formElement.querySelector('.error[data-input-invalid=true]');
		if (errorElement) {
			formElement.querySelectorAll('[data-input-focusable]').forEach((ele) => {
				(ele as HTMLElement).focus();
				(ele as HTMLElement).blur();
			});
			return;
		}
		const submittedValues: { [key in string]: any } = Object.fromEntries(data.entries());
		formElement.querySelectorAll('[data-as-array="true"]').forEach((e) => {
			const inputName = e.getAttribute('name');
			if (inputName) submittedValues[inputName] = JSON.parse(submittedValues[inputName] as string);
		});
		formElement.querySelectorAll('[data-as-file="true"]').forEach((e) => {
			const inputName = e.getAttribute('name');
			if (inputName) {
				submittedValues[inputName] = e.files;
			}
		});
		formElement.querySelectorAll('[data-value]').forEach((e) => {
			const inputName = e.getAttribute('name');
			if (inputName) {
				submittedValues[inputName] = e.getAttribute('data-value');
			}
		});
		onSubmit(submittedValues);
	};
</script>

<form on:submit={onSubmitForm} action="">
	<slot />
</form>
