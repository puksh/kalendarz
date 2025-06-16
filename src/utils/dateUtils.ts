export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function generateMonthDays(
  selectedYear: number,
  selectedMonth: number
): Array<{
  date: Date;
  dayShift1: number | null;
  dayShift2: number | null;
  nightShift1: number | null;
  nightShift2: number | null;
  dayShift1Name: string;
  dayShift2Name: string;
  nightShift1Name: string;
  nightShift2Name: string;
  isCurrentMonth: boolean;
}> {
  const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const monthDays = [];

  for (let i = 1; i <= lastDay; i++) {
    monthDays.push({
      date: new Date(selectedYear, selectedMonth, i),
      dayShift1: null,
      dayShift2: null,
      nightShift1: null,
      nightShift2: null,
      dayShift1Name: 'Not assigned',
      dayShift2Name: 'Not assigned',
      nightShift1Name: 'Not assigned',
      nightShift2Name: 'Not assigned',
      isCurrentMonth: true
    });
  }

  return monthDays;
}

export function getDateString(date: Date): string {
  return date.toDateString();
}
