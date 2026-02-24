import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Habit, HabitRecord, UserSticker } from '../types';
import { drawGacha } from '../data/presetStickers';
import { format } from 'date-fns';

interface AppStore extends AppState {
  // Gacha actions
  canDrawGacha: () => boolean;
  drawGachaTicket: () => UserSticker | null;
  
  // Habit actions
  addHabit: (name: string, icon: string, color: string) => void;
  deleteHabit: (id: string) => void;
  
  // Record actions
  addHabitRecord: (habitId: string, userStickerId: string, stickerId: string, date: string) => void;
  getRecordsForHabit: (habitId: string) => HabitRecord[];
  getRecordForDate: (habitId: string, date: string) => HabitRecord | undefined;
  hasRecordToday: (habitId: string) => boolean;
  
  // UserSticker actions
  getAvailableStickers: () => UserSticker[];
  markStickerAsUsed: (userStickerId: string) => void;
}

const today = () => format(new Date(), 'yyyy-MM-dd');

function calculateStreak(records: HabitRecord[], habitId: string): number {
  const dates = records
    .filter(r => r.habitId === habitId)
    .map(r => r.date)
    .sort()
    .reverse();
  
  if (dates.length === 0) return 0;
  
  let streak = 0;
  let current = new Date();
  
  for (const dateStr of dates) {
    const recordDate = format(current, 'yyyy-MM-dd');
    if (dateStr === recordDate) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      userStickers: [],
      habits: [],
      habitRecords: [],
      gachaTicket: { count: 1, lastReceivedAt: null },

      canDrawGacha: () => {
        const { gachaTicket } = get();
        return gachaTicket.count > 0;
      },

      drawGachaTicket: () => {
        const { gachaTicket, userStickers } = get();
        if (gachaTicket.count <= 0) return null;

        const ownedIds = [...new Set(userStickers.map(us => us.stickerId))];
        const sticker = drawGacha(ownedIds);
        if (!sticker) return null; // all collected

        const userSticker: UserSticker = {
          id: `us-${Date.now()}`,
          stickerId: sticker.id,
          acquiredAt: new Date().toISOString(),
          isUsed: false,
        };

        set({
          userStickers: [...userStickers, userSticker],
          gachaTicket: {
            count: gachaTicket.count - 1,
            lastReceivedAt: new Date().toISOString(),
          },
        });

        return userSticker;
      },

      addHabit: (name, icon, color) => {
        const habit: Habit = {
          id: `h-${Date.now()}`,
          name,
          icon,
          color,
          createdAt: new Date().toISOString(),
          streak: 0,
          totalDays: 0,
        };
        set(state => ({ habits: [...state.habits, habit] }));
      },

      deleteHabit: (id) => {
        set(state => ({
          habits: state.habits.filter(h => h.id !== id),
          habitRecords: state.habitRecords.filter(r => r.habitId !== id),
        }));
      },

      addHabitRecord: (habitId, userStickerId, stickerId, date) => {
        const record: HabitRecord = {
          id: `hr-${Date.now()}`,
          habitId,
          date,
          userStickerId,
          stickerId,
        };
        
        set(state => {
          const newRecords = [...state.habitRecords, record];
          const streak = calculateStreak(newRecords, habitId);
          const totalDays = newRecords.filter(r => r.habitId === habitId).length;
          
          return {
            habitRecords: newRecords,
            habits: state.habits.map(h =>
              h.id === habitId ? { ...h, streak, totalDays } : h
            ),
          };
        });
      },

      getRecordsForHabit: (habitId) => {
        return get().habitRecords.filter(r => r.habitId === habitId);
      },

      getRecordForDate: (habitId, date) => {
        return get().habitRecords.find(r => r.habitId === habitId && r.date === date);
      },

      hasRecordToday: (habitId) => {
        return !!get().habitRecords.find(r => r.habitId === habitId && r.date === today());
      },

      getAvailableStickers: () => {
        return get().userStickers;
      },

      markStickerAsUsed: (userStickerId) => {
        set(state => ({
          userStickers: state.userStickers.map(us =>
            us.id === userStickerId ? { ...us, isUsed: true } : us
          ),
        }));
      },
    }),
    {
      name: 'sticker-habit-storage',
    }
  )
);
