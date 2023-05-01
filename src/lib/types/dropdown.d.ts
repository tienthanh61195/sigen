import type { GeneralFunction } from './common';

export type DropdownOptionAsObject = { label: string; onSelect?: GeneralFunction, value?: any, options?: DropdownOptionAsObject[] }
export type DropdownOption = (DropdownOptionAsObject | string);
