import { isPolishHoliday } from './polishHolidays';

export const getMonthName = (month: number): string => {
  const monthNames = [
    'Styczeń',
    'Luty',
    'Marzec',
    'Kwiecień',
    'Maj',
    'Czerwiec',
    'Lipiec',
    'Sierpień',
    'Wrzesień',
    'Październik',
    'Listopad',
    'Grudzień'
  ];
  return monthNames[month];
};

export const getExcelColumnLetter = (columnNumber: number): string => {
  let dividend = columnNumber;
  let columnName = '';
  let modulo;

  while (dividend > 0) {
    modulo = (dividend - 1) % 26;
    columnName = String.fromCharCode(65 + modulo) + columnName;
    dividend = Math.floor((dividend - modulo) / 26);
  }

  return columnName;
};

export const getFormattedShift = (
  personId: number,
  date: Date,
  separator = '\n'
): string => {
  const dateString = date.toDateString();
  const shiftData = sessionStorage.getItem(dateString);

  if (shiftData) {
    const parsedData = JSON.parse(shiftData);
    const shifts = [];

    if (
      parsedData.dayShift1 === personId ||
      parsedData.dayShift2 === personId
    ) {
      shifts.push('D');
    }
    if (
      parsedData.nightShift1 === personId ||
      parsedData.nightShift2 === personId
    ) {
      shifts.push('N');
    }

    return shifts.join(separator);
  }
  return '';
};

export const isWeekendOrHoliday = (date: Date): boolean => {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return true;
  }
  return isPolishHoliday(date).isHoliday;
};
