import type { InputChangeEventHandler } from "./events";

export type InputComponentChangeHandler<T extends Event = Event> = (v: any, e?: T, name?: string) => any
export type InputOption = { value: any, label: string | svelte }
export interface InputPropsForInputComponents {
  value?: string;
  label?: string;
  class?: string;
  name?: string;
  onChange?: InputChangeEventHandler
  options?: InputOption[];
  disableSearch?: boolean,
  multiple?: boolean
}
