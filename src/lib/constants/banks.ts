enum Banks {
  vpBank = 'vpBank',
  mbBank = 'mbBank',
  vietinBank = 'vietinBank'
}
export interface ICommonBankExtraSchema {
  value: string, label: string, options?: ICommonBankExtraSchema[]
}
export const bankSchema: Record<Banks, { value: string; label: string }[]> = {
  vpBank: [
    { value: 'id', label: 'STT' },
    { value: 'transactionContent', label: 'Nội dung giao dịch' },
    { value: 'transactionDateTime', label: 'Thời gian giao dịch' },
    { value: 'credit', label: 'Số tiền ghi có' },
    { value: 'debit', label: 'Số tiền ghi nợ' }
  ],
  mbBank: [
    { value: 'id', label: 'STT' },
    { value: 'transactionContent', label: 'NỘI DUNG' },
    { value: 'transactionDateTime', label: 'NGÀY GIAO DỊCH' },
    { value: 'credit', label: 'GHI CÓ' },
    { value: 'debit', label: 'GHI NỢ' }
  ],
  vietinBank: [
    { value: 'id', label: 'STT' },
    { value: 'transactionContent', label: 'Nội dung' },
    { value: 'transactionDateTime', label: 'Ngày' },
    { value: 'credit', label: 'Ghi có' },
    { value: 'debit', label: 'Ghi nợ' }
  ]
};
export default Banks;
export type Bank = keyof typeof Banks;
