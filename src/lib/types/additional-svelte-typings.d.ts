declare namespace svelteHTML {
	// enhance elements
	// interface IntrinsicElements {
	//     'my-custom-element': { someattribute: string; 'on:event': (e: CustomEvent<any>) => void };
	// }
	// enhance attributes
	interface HTMLAttributes<T> {
		// If you want to use on:beforeinstallprompt
		'on:outclick'?: (event: any) => any;
		'on:consider'?: (event: any) => any;
		'on:finalize'?: (event: any) => any;
		// If you want to use myCustomAttribute={..} (note: all lowercase)
		// mycustomattribute?: any;
		// You can replace any with something more specific if you like
	}
}
