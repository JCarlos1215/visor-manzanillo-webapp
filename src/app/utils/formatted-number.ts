export const getFormattedNumber = (valor: number) => {
  return new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    minimumIntegerDigits: 1,
  }).format(valor);
};
