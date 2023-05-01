// export type InputChangeEventHandler = (e: Event & { currentTarget: EventTarget & Element }) => any;
export type EventParam = Event & { currentTarget: EventTarget & Element }
export type ElementClickEventHandler<T = EventParam> = (e: T) => any
export type InputChangeEventHandler = (event: Event & { currentTarget: EventTarget & (HTMLInputElement | HTMLTextAreaElement) }) => any
