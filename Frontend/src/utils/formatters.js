export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatCurrency(value) {
  return `${formatNumber(value)} ج.م`
}

export function statusTone(status) {
  switch (status) {
    case 'مكتمل':
      return 'success'
    case 'قيد التنفيذ':
      return 'accent'
    case 'قيد الانتظار':
      return 'muted'
    default:
      return 'muted'
  }
}
