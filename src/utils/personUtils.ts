import { MESSAGES } from '../constants/messages';

export function resolvePersonName(
  id: number,
  people: any[]
): { name: string; isRatownik: boolean } {
  const person = people.find((p) => p.id === id);
  return person
    ? { name: person.name, isRatownik: person.ratownik }
    : { name: MESSAGES.NOT_ASSIGNED, isRatownik: false };
}
