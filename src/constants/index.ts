export { MESSAGES } from './messages';

export const SHIFT_TYPES = [
  'dayShift1',
  'dayShift2',
  'nightShift1',
  'nightShift2'
] as const;

export const PEOPLE_ORDER = [
  'Milena',
  'Mikołaj',
  'Aleksandra',
  'Joanna',
  'Łukasz',
  'Natalia',
  'Marcin'
] as const;

export const SHIFT_OPTIONS = [
  { value: '', label: '' },
  { value: 'D', label: 'D' },
  { value: 'N', label: 'N' },
  { value: 'D N', label: 'D N' }
] as const;

export const VALID_SHIFT_VALUES = ['D', 'N', 'D N', ''] as const;
export type ValidShiftValue = (typeof VALID_SHIFT_VALUES)[number];
