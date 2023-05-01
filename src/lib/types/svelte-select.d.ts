/* eslint-disable @typescript-eslint/ban-types */

declare namespace SvelteSelect {
	export type SvelteSelectType = {
		loadOptions?: any;
		filterText?: string;
		items?: any;
		multiple?: boolean;
		value?: any;
		itemId?: string;
		groupBy?: any;
		filterSelectedItems?: boolean;
		itemFilter?: (label: any, filterText: any) => boolean;
		label?: string;
		required?: boolean;
		id?: any;
		input?: any;
		filter?: typeof _filter;
		name?: any;
		justValue?: any;
		getItems?: typeof _getItems;
		container?: any;
		multiFullItemClearable?: boolean;
		disabled?: boolean;
		focused?: boolean;
		placeholder?: string;
		placeholderAlwaysShow?: boolean;
		groupFilter?: (groups: any) => any;
		groupHeaderSelectable?: boolean;
		containerStyles?: string;
		hasError?: boolean;
		createGroupHeaderItem?: (
			groupValue: any,
			item: any
		) => {
			[x: string]: any;
			value: any;
		};
		getFilteredItems?: () => any;
		searchable?: boolean;
		inputStyles?: string;
		clearable?: boolean;
		loading?: boolean;
		listOpen?: boolean;
		debounce?: (fn: any, wait?: number) => void;
		debounceWait?: number;
		hideEmptyState?: boolean;
		inputAttributes?: {};
		listAutoWidth?: boolean;
		showChevron?: boolean;
		listOffset?: number;
		hoverItemIndex?: number;
		floatingConfig?: {};
		class?: string;
		handleClear?: () => void;
		ariaValues?: (values: any) => string;
		ariaListOpen?: (label: any, count: any) => string;
		ariaFocused?: () => string;
	};
}
