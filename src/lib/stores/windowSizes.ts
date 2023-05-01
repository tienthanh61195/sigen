import { writable } from "svelte/store";

const windowSizesStore = writable<{ width: number, height: number }>({ height: 0, width: 0 })


export default windowSizesStore