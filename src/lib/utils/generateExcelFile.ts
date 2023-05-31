import * as xlsx from 'xlsx-js-style';

export default async function generateExcelFile(worksheetData: any[], name: string) {
  // const header = worksheetData[0];
  // const worksheetContent = worksheetData.slice(1);
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet(worksheetData);
  xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
  // xlsx.utils.sheet_add_aoa(
  //   ws,
  //   // [
  //   // 	[
  //   // 		{
  //   // 			v: `BÁO CÁO TÀI CHÍNH THÁNG ${reportTimePeriod}`,
  //   // 			t: 's',
  //   // 			s: {
  //   // 				font: { sz: '15' }
  //   // 			}
  //   // 		}
  //   // 	]
  //   // ],
  //   [header],
  //   {
  //     origin: 'A1'
  //   }
  // );
  // // const ws = workbook.Sheets['Sheet1'];
  // // xlsx.utils.sheet_add_json(ws, [['Created ' + new Date().toISOString()], ['dcmvcl']], {
  // // 	origin: -1
  // // });
  // // Package and Release Data (`writeFile` tries to write and save an XLSB file)
  const wscols = worksheetData[0].map(() => ({ wch: 20 }))

  const wsrows = [{ hpx: 20 }];
  // const merge = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
  // ws['!merges'] = merge;
  ws['!cols'] = wscols;
  ws['!rows'] = wsrows;
  xlsx.writeFile(wb, `${name}.xlsx`, {});
}