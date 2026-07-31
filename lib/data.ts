// This file used to contain mock data. 
// Now it only contains utility functions.


export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};
