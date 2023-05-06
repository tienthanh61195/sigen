export const commonStyle = ({
	v = '',
	alignment = 'center',
	color,
	sz,
	bold
}: {
	v: string | number;
	alignment?: string;
	color?: string;
	sz?: string;
	bold?: boolean;
}) => ({
	v,
	t: 's',
	s: {
		alignment: { vertical: 'center', horizontal: alignment },
		font: { bold, color: { rgb: color }, sz }
	}
});
export const titleStyle = (v: string | number, alignment = 'left', color = '1d3993') => ({
	v,
	t: 's',
	s: {
		alignment: { vertical: 'center', horizontal: alignment },
		font: { bold: true, color: { rgb: color }, sz: '14' },
		fill: { theme: 4, patternType: 'solid' }
	}
});
export const commonTitleStyle = (v: string | number, alignment = 'left', color = 'ff9300') => ({
	v,
	t: 's',
	s: {
		alignment: { vertical: 'center', horizontal: alignment },
		font: { bold: true, color: { rgb: color }, sz: '14' }
	}
});
