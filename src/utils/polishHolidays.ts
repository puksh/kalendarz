export function getPolishHolidays(
  year: number
): { date: Date; name: string }[] {
  // Fixed date holidays
  const holidays = [
    { date: new Date(year, 0, 1), name: 'Nowy Rok' },
    { date: new Date(year, 0, 6), name: 'Święto Trzech Króli' },
    { date: new Date(year, 4, 1), name: 'Święto Pracy' },
    { date: new Date(year, 4, 3), name: 'Święto Konstytucji 3 Maja' },
    {
      date: new Date(year, 7, 15),
      name: 'Wniebowzięcie Najświętszej Maryi Panny'
    },
    { date: new Date(year, 10, 1), name: 'Wszystkich Świętych' },
    { date: new Date(year, 10, 11), name: 'Święto Niepodległości' },
    { date: new Date(year, 11, 25), name: 'Boże Narodzenie (pierwszy dzień)' },
    { date: new Date(year, 11, 26), name: 'Boże Narodzenie (drugi dzień)' }
  ];

  // Calculate Easter date
  const easter = calculateEaster(year);

  // Add Easter and related holidays
  holidays.push({ date: easter, name: 'Wielkanoc' });

  // Easter Monday (1 day after Easter)
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);
  holidays.push({ date: easterMonday, name: 'Poniedziałek Wielkanocny' });

  // Pentecost (49 days after Easter)
  const pentecost = new Date(easter);
  pentecost.setDate(easter.getDate() + 49);
  holidays.push({ date: pentecost, name: 'Zielone Świątki' });

  // Corpus Christi (60 days after Easter)
  const corpusChristi = new Date(easter);
  corpusChristi.setDate(easter.getDate() + 60);
  holidays.push({ date: corpusChristi, name: 'Boże Ciało' });

  return holidays;
}

// Calculate Easter date using the Meeus/Jones/Butcher algorithm
function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month, day);
}

// Helper function to check if a date is a Polish holiday
export function isPolishHoliday(date: Date): {
  isHoliday: boolean;
  name?: string;
} {
  const holidays = getPolishHolidays(date.getFullYear());
  const dateString = date.toDateString();

  for (const holiday of holidays) {
    if (holiday.date.toDateString() === dateString) {
      return { isHoliday: true, name: holiday.name };
    }
  }

  return { isHoliday: false };
}
