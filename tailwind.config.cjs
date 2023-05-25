module.exports = {
	theme: {
		extend: {
			borderColor: {
				input: '#999999',
				'input-focus': '#385d7e'
			},
			fontSize: {
				main: '16px'
			},
			scale: {
				80: '0.8'
			},
			colors: {
				placeholder: '#A3A3A3',
				'main-blue': '#1a73e8',
				'btn-primary': '#1d3993',
				'btn-cancel': '#7a829a',
				'general-active': '#52c41a',
				'btn-secondary': '#ff9300',
				// "btn-secondary": "#f63d00",
				disabled: '#f2f2f2',
				'calendar-today': '#EBF4FF',
				danger: '#DC3545'
			},
			screens: {
				xxl: '1480px'
			},
			boxShadow: {
				default:
					'0 6px 16px 0 rgb(0 0 0 / 8%), 0 3px 6px -4px rgb(0 0 0 / 12%), 0 9px 28px 8px rgb(0 0 0 / 5%)'
			},
			borderRadius: {
				default: '8px'
			}
		}
	},
	content: ['./src/**/*.{html,js,svelte,ts}']
};
