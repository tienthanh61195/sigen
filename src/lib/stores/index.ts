import { derived, writable, type Writable } from "svelte/store";
import messages from '../intl/messages.json'

export const langMessageStore = writable<keyof typeof messages>('en')
export const messagesStore = derived(langMessageStore, $lang => messages[$lang])

