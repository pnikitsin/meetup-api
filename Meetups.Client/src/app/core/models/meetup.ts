export interface Meetup {
  id: string;
  name: string;
  /** Локальное «настенное» время без timezone — так его хранит backend. */
  dateAndTime: string;
  organizer: string;
  address: string;
  description: string;
}

export type MeetupInput = Omit<Meetup, 'id'>;

export type MeetupStatusKey = 'upcoming' | 'today' | 'past';

export interface MeetupStatus {
  key: MeetupStatusKey;
  label: string;
}
