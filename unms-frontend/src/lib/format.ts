const idCurrency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const idNumber = new Intl.NumberFormat('id-ID');

export function formatCurrency(value: number): string {
  // Indonesian format with thin space ("Rp ") prefix
  return idCurrency.format(value).replace(/\u00A0/g, ' ');
}

export function formatNumber(value: number): string {
  return idNumber.format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}
