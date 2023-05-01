// export type CalendarEvent = {}

export type CalendarDateType = { month: number; year: number; day: number };
export type CalendarItemExtraType = { name: string, label: string, content: string }
export type CalendarItemType<T extends Record<string, any> = Record<string, any>> = { id: any; description: string; start: string; end: string; date: string } & T
export type CalendarItemClickHandler<T = CalendarItemType> = (item: T) => void;
