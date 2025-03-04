export const getFormattedDate = (fecha: Date, separador: string = '/', order: string = 'dmy'): string => {
  const formatDay = fecha.getDate() < 10 ? '0' + fecha.getDate().toString() : fecha.getDate().toString();
  const formatMonth = fecha.getMonth() + 1 < 10 ? '0' + (fecha.getMonth() + 1).toString() : (fecha.getMonth() + 1).toString();
  let date = '';
  switch (order) {
    case 'dmy': 
      date = formatDay + separador + formatMonth + separador + fecha.getFullYear().toString();
      break;
    case 'ymd':
      date = fecha.getFullYear().toString() + separador + formatMonth + separador + formatDay;
      break;
    case 'mdy':
      date =  formatMonth + separador + formatDay + separador + fecha.getFullYear().toString();
      break;
    default:
      date = formatDay + separador + formatMonth + separador + fecha.getFullYear().toString();
      break;
  }
  return date;
};

export const getFormattedHour = (fecha: Date): string => {
  const formatHour = fecha.getHours() < 10 ? '0' + fecha.getHours().toString() : fecha.getHours().toString();
  const formatMinutes = fecha.getMinutes() < 10 ? '0' + fecha.getMinutes().toString() : fecha.getMinutes().toString();
  return formatHour + ':' + formatMinutes;
};
