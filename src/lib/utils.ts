export const formatPrice = (value: number, currency: string = 'USD') => {
  if (value === 0) return '0'; 
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

