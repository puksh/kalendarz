export type Person = {
  id: number;
  name: string;
  ratownik: boolean;
};

export type ShiftType =
  | 'dayShift1'
  | 'dayShift2'
  | 'nightShift1'
  | 'nightShift2';

export type DayData = {
  date: Date;
  dayShift1: number | null;
  dayShift2: number | null;
  nightShift1: number | null;
  nightShift2: number | null;
  dayShift1Name?: string;
  dayShift2Name?: string;
  nightShift1Name?: string;
  nightShift2Name?: string;
  dayShift1Ratownik?: boolean;
  dayShift2Ratownik?: boolean;
  nightShift1Ratownik?: boolean;
  nightShift2Ratownik?: boolean;
  dayShift1UserChanged?: boolean;
  dayShift2UserChanged?: boolean;
  nightShift1UserChanged?: boolean;
  nightShift2UserChanged?: boolean;
  isCurrentMonth?: boolean;
};

export type ShiftData = {
  dayShift1: number | null;
  dayShift2: number | null;
  nightShift1: number | null;
  nightShift2: number | null;
};

export type AuthMode = 'save' | 'salary';

export type ShiftDataCollection = {
  [key: string]: ShiftData;
};
