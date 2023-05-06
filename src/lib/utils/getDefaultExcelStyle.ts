export const alignmentOnly = (v: string | number, alignment = 'center') => ({
	v,
	t: 's',
	s: {
		alignment: { vertical: 'center', horizontal: alignment }
	}
});
export const titleStyle = (v: string | number, alignment = 'left') => ({
	v,
	t: 's',
	s: {
		alignment: { vertical: 'center', horizontal: alignment },
		font: { bold: true, color: { rgb: '1d3993' }, sz: '14' }
		// fill: { bgColor: { rgb: 'FF0000' } }
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
