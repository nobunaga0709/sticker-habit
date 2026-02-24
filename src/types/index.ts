export type Rarity = 'normal' | 'rare' | 'superRare';

export interface Sticker {
  id: string;
  name: string;
  emoji: string; // Use emoji as visual representation
  rarity: Rarity;
  color: string; // Background color for the sticker card
}

export interface UserSticker {
  id: string;
  stickerId: string;
  acquiredAt: string; // ISO date string
  isUsed: boolean;
}

export interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string; // emoji icon
  createdAt: string;
  streak: number;
  totalDays: number;
}

export interface HabitRecord {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  userStickerId: string; // reference to UserSticker.id
  stickerId: string; // reference to Sticker.id
}

export interface GachaTicket {
  count: number;
  lastReceivedAt: string | null; // ISO date string
}

export interface AppState {
  userStickers: UserSticker[];
  habits: Habit[];
  habitRecords: HabitRecord[];
  gachaTicket: GachaTicket;
}
