import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { STICKER_MAP } from '../data/presetStickers';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { ja } from 'date-fns/locale';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export default function CalendarScreen() {
  const { habits, habitRecords } = useAppStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(
    habits.length > 0 ? habits[0].id : null
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Update selected habit when habits change
  const selectedHabit = habits.find(h => h.id === selectedHabitId) ?? habits[0] ?? null;
  const effectiveHabitId = selectedHabit?.id ?? null;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const recordsForHabit = effectiveHabitId
    ? habitRecords.filter(r => r.habitId === effectiveHabitId)
    : [];

  const recordByDate = Object.fromEntries(
    recordsForHabit.map(r => [r.date, r])
  );

  const selectedRecord = selectedDate ? recordByDate[selectedDate] : null;
  const selectedSticker = selectedRecord ? STICKER_MAP[selectedRecord.stickerId] : null;

  const monthStats = {
    achieved: recordsForHabit.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    }).length,
    daysInMonth: calendarDays.filter(d => isSameMonth(d, currentMonth)).length,
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📅 カレンダー</h1>
      </div>

      {/* Habit Selector */}
      {habits.length > 0 ? (
        <div style={styles.habitTabsWrapper}>
          <div style={styles.habitTabs}>
            {habits.map(habit => (
              <button
                key={habit.id}
                onClick={() => {
                  setSelectedHabitId(habit.id);
                  setSelectedDate(null);
                }}
                style={{
                  ...styles.habitTab,
                  background: habit.id === effectiveHabitId ? habit.color : '#fff',
                  color: habit.id === effectiveHabitId ? '#fff' : '#888',
                  border: `2px solid ${habit.id === effectiveHabitId ? habit.color : '#e0e0e0'}`,
                }}
              >
                {habit.icon} {habit.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={styles.noHabitsMessage}>
          まず習慣を作ってみよう！
        </div>
      )}

      {selectedHabit && (
        <>
          {/* Month Navigation */}
          <div style={styles.monthNav}>
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} style={styles.navBtn}>
              ‹
            </button>
            <div style={styles.monthTitle}>
              <span style={styles.monthText}>
                {format(currentMonth, 'yyyy年M月', { locale: ja })}
              </span>
              <span style={{
                ...styles.monthBadge,
                background: `${selectedHabit.color}22`,
                color: selectedHabit.color,
              }}>
                {monthStats.achieved}/{monthStats.daysInMonth}日達成
              </span>
            </div>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} style={styles.navBtn}>
              ›
            </button>
          </div>

          {/* Calendar Grid */}
          <div style={styles.calendarCard}>
            {/* Weekday headers */}
            <div style={styles.weekdayRow}>
              {WEEKDAYS.map((d, i) => (
                <div key={d} style={{
                  ...styles.weekdayCell,
                  color: i === 0 ? '#f44336' : i === 6 ? '#2196f3' : '#888',
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div style={styles.daysGrid}>
              {calendarDays.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const record = recordByDate[dateStr];
                const sticker = record ? STICKER_MAP[record.stickerId] : null;
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isTodayDay = isToday(day);
                const isSelected = selectedDate === dateStr;
                const dayOfWeek = day.getDay();

                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      if (!isCurrentMonth) return;
                      setSelectedDate(isSelected ? null : dateStr);
                    }}
                    style={{
                      ...styles.dayCell,
                      opacity: isCurrentMonth ? 1 : 0.2,
                      background: isSelected
                        ? `${selectedHabit.color}22`
                        : sticker
                        ? `${selectedHabit.color}12`
                        : 'transparent',
                      border: isTodayDay
                        ? `2px solid ${selectedHabit.color}`
                        : isSelected
                        ? `2px solid ${selectedHabit.color}88`
                        : '2px solid transparent',
                      borderRadius: '12px',
                      cursor: isCurrentMonth ? 'pointer' : 'default',
                    }}
                  >
                    <span style={{
                      ...styles.dayNumber,
                      color: isTodayDay
                        ? selectedHabit.color
                        : dayOfWeek === 0
                        ? '#f44336'
                        : dayOfWeek === 6
                        ? '#2196f3'
                        : '#444',
                      fontWeight: isTodayDay ? 800 : 400,
                    }}>
                      {format(day, 'd')}
                    </span>
                    {sticker && (
                      <span style={styles.dayStickerEmoji}>{sticker.emoji}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day detail */}
          {selectedDate && (
            <div style={{
              ...styles.detailCard,
              borderLeft: `4px solid ${selectedHabit.color}`,
              background: `${selectedHabit.color}12`,
            }}>
              <div style={styles.detailDate}>
                {format(new Date(selectedDate), 'M月d日 (E)', { locale: ja })}
              </div>
              {selectedSticker ? (
                <div style={styles.detailContent}>
                  <span style={styles.detailEmoji}>{selectedSticker.emoji}</span>
                  <div>
                    <div style={styles.detailStickerName}>{selectedSticker.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {selectedHabit.name} 達成！ 🎉
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#aaa', fontSize: '14px' }}>
                  この日は未達成です
                </div>
              )}
            </div>
          )}

          {/* Streak summary */}
          <div style={styles.summaryRow}>
            <div style={{ ...styles.summaryCard, borderTop: `3px solid ${selectedHabit.color}` }}>
              <div style={{ ...styles.summaryNum, color: selectedHabit.color }}>
                🔥 {selectedHabit.streak}
              </div>
              <div style={styles.summaryLabel}>連続達成</div>
            </div>
            <div style={{ ...styles.summaryCard, borderTop: `3px solid ${selectedHabit.color}` }}>
              <div style={{ ...styles.summaryNum, color: selectedHabit.color }}>
                ✨ {selectedHabit.totalDays}
              </div>
              <div style={styles.summaryLabel}>累計達成</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px 20px',
    maxWidth: '480px',
    margin: '0 auto',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #fff8f0 0%, #fef6ff 100%)',
    fontFamily: '"Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif',
  },
  header: { marginBottom: '16px' },
  title: { fontSize: '24px', fontWeight: 700, margin: 0, color: '#333' },
  habitTabsWrapper: {
    overflowX: 'auto',
    marginBottom: '16px',
    paddingBottom: '4px',
  },
  habitTabs: {
    display: 'flex',
    gap: '8px',
    width: 'max-content',
  },
  habitTab: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
  },
  noHabitsMessage: {
    textAlign: 'center',
    color: '#bbb',
    padding: '24px',
    background: '#fff',
    borderRadius: '16px',
    marginBottom: '16px',
  },
  monthNav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  navBtn: {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    width: '36px',
    height: '36px',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
  },
  monthTitle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  monthText: { fontSize: '16px', fontWeight: 700, color: '#333' },
  monthBadge: {
    fontSize: '12px',
    fontWeight: 600,
    padding: '2px 10px',
    borderRadius: '10px',
  },
  calendarCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    marginBottom: '16px',
  },
  weekdayRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    marginBottom: '8px',
  },
  weekdayCell: {
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: 600,
    padding: '4px 0',
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
  },
  dayCell: {
    aspectRatio: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    background: 'none',
  },
  dayNumber: {
    fontSize: '12px',
    lineHeight: 1.2,
  },
  dayStickerEmoji: {
    fontSize: '18px',
    lineHeight: 1,
  },
  detailCard: {
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  detailDate: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#555',
    marginBottom: '8px',
  },
  detailContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  detailEmoji: { fontSize: '40px' },
  detailStickerName: { fontSize: '16px', fontWeight: 700, color: '#333' },
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  summaryCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '16px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  summaryNum: { fontSize: '28px', fontWeight: 800, marginBottom: '4px' },
  summaryLabel: { fontSize: '12px', color: '#888' },
};
