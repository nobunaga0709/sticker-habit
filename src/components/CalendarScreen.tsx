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

  const recordByDate = Object.fromEntries(recordsForHabit.map(r => [r.date, r]));

  const selectedRecord = selectedDate ? recordByDate[selectedDate] : null;
  const selectedSticker = selectedRecord ? STICKER_MAP[selectedRecord.stickerId] : null;

  const achievedThisMonth = recordsForHabit.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === currentMonth.getMonth() &&
           d.getFullYear() === currentMonth.getFullYear();
  }).length;

  const daysInMonth = calendarDays.filter(d => isSameMonth(d, currentMonth)).length;
  const achievePct = daysInMonth > 0 ? Math.round((achievedThisMonth / daysInMonth) * 100) : 0;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>カレンダー</h1>
      </div>

      {/* Habit tabs */}
      {habits.length > 0 ? (
        <div style={styles.tabsWrapper}>
          <div style={styles.tabs}>
            {habits.map(habit => {
              const active = habit.id === effectiveHabitId;
              return (
                <button
                  key={habit.id}
                  onClick={() => { setSelectedHabitId(habit.id); setSelectedDate(null); }}
                  style={{
                    ...styles.tab,
                    background: active ? habit.color : '#fff',
                    color: active ? '#fff' : '#7A6280',
                    border: `3px solid ${active ? habit.color : 'rgba(0,0,0,0.08)'}`,
                    boxShadow: active
                      ? `3px 3px 8px ${habit.color}40, inset -1px -1px 4px rgba(0,0,0,0.06)`
                      : '2px 2px 6px rgba(0,0,0,0.07)',
                    cursor: 'pointer',
                  }}
                >
                  <span>{habit.icon}</span>
                  <span>{habit.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={styles.noHabits}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9B1FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <p style={{ color: '#B0A0B8', fontWeight: 700, margin: '8px 0 0' }}>まず習慣を作ってみよう！</p>
        </div>
      )}

      {selectedHabit && (
        <>
          {/* Month navigation */}
          <div style={styles.monthNav}>
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              style={styles.navBtn}
              aria-label="前の月"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A6280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>

            <div style={styles.monthInfo}>
              <p style={styles.monthText}>
                {format(currentMonth, 'yyyy年M月', { locale: ja })}
              </p>
              <span style={{
                ...styles.monthBadge,
                background: `${selectedHabit.color}20`,
                color: selectedHabit.color,
                border: `2px solid ${selectedHabit.color}40`,
              }}>
                {achievedThisMonth}日達成
              </span>
            </div>

            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              style={styles.navBtn}
              aria-label="次の月"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A6280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          {/* Month progress bar */}
          <div style={styles.monthProgressWrap}>
            <div style={styles.monthProgressTrack}>
              <div style={{
                ...styles.monthProgressFill,
                width: `${achievePct}%`,
                background: `linear-gradient(90deg, ${selectedHabit.color}, ${selectedHabit.color}99)`,
              }} />
            </div>
            <span style={{ fontSize: '11px', color: '#B0A0B8', fontWeight: 600 }}>
              {daysInMonth}日中 {achievedThisMonth}日 ({achievePct}%)
            </span>
          </div>

          {/* Calendar */}
          <div style={styles.calendarCard}>
            {/* Weekday row */}
            <div style={styles.weekdayRow}>
              {WEEKDAYS.map((d, i) => (
                <div key={d} style={{
                  ...styles.weekdayCell,
                  color: i === 0 ? '#FF6B9D' : i === 6 ? '#42A5F5' : '#B0A0B8',
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Days */}
            <div style={styles.daysGrid}>
              {calendarDays.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const record = recordByDate[dateStr];
                const sticker = record ? STICKER_MAP[record.stickerId] : null;
                const inMonth = isSameMonth(day, currentMonth);
                const todayDay = isToday(day);
                const selected = selectedDate === dateStr;
                const dow = day.getDay();

                return (
                  <button
                    key={dateStr}
                    onClick={() => { if (!inMonth) return; setSelectedDate(selected ? null : dateStr); }}
                    aria-label={`${format(day, 'M月d日', { locale: ja })}${sticker ? ` ${sticker.name}` : ''}`}
                    disabled={!inMonth}
                    style={{
                      ...styles.dayCell,
                      opacity: inMonth ? 1 : 0.15,
                      background: selected
                        ? `${selectedHabit.color}20`
                        : sticker
                        ? `${selectedHabit.color}10`
                        : 'transparent',
                      border: todayDay
                        ? `3px solid ${selectedHabit.color}`
                        : selected
                        ? `3px solid ${selectedHabit.color}60`
                        : '3px solid transparent',
                      boxShadow: selected
                        ? `inset 2px 2px 6px ${selectedHabit.color}20`
                        : 'none',
                      cursor: inMonth ? 'pointer' : 'default',
                    }}
                  >
                    <span style={{
                      fontSize: '11px',
                      fontWeight: todayDay ? 800 : 500,
                      color: todayDay
                        ? selectedHabit.color
                        : dow === 0 ? '#FF6B9D'
                        : dow === 6 ? '#42A5F5'
                        : '#2D1B33',
                      lineHeight: 1,
                    }}>
                      {format(day, 'd')}
                    </span>
                    {sticker && (
                      <span style={{ fontSize: '16px', lineHeight: 1 }}>{sticker.emoji}</span>
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
              background: `${selectedHabit.color}10`,
              border: `3px solid ${selectedHabit.color}30`,
              borderLeftWidth: '4px',
              animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
              <p style={styles.detailDate}>
                {format(new Date(selectedDate), 'M月d日 (E)', { locale: ja })}
              </p>
              {selectedSticker ? (
                <div style={styles.detailContent}>
                  <span style={{ fontSize: '44px', lineHeight: 1 }}>{selectedSticker.emoji}</span>
                  <div>
                    <p style={{ fontWeight: 800, color: '#2D1B33', margin: '0 0 2px', fontSize: '16px' }}>
                      {selectedSticker.name}
                    </p>
                    <p style={{ color: '#7A6280', fontSize: '13px', margin: 0, fontWeight: 600 }}>
                      {selectedHabit.icon} {selectedHabit.name} 達成！
                    </p>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#B0A0B8', fontSize: '14px', fontWeight: 600, margin: 0 }}>
                  この日は未達成です
                </p>
              )}
            </div>
          )}

          {/* Stats */}
          <div style={styles.statsRow}>
            {[
              { icon: '🔥', num: selectedHabit.streak, label: '連続達成日' },
              { icon: '✨', num: selectedHabit.totalDays, label: '累計達成日' },
            ].map(s => (
              <div key={s.label} style={{
                ...styles.statCard,
                borderTop: `4px solid ${selectedHabit.color}`,
              }}>
                <p style={{ ...styles.statNum, color: selectedHabit.color }}>
                  {s.icon} {s.num}
                </p>
                <p style={styles.statLabel}>{s.label}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '28px 20px 24px',
    maxWidth: '480px',
    margin: '0 auto',
    minHeight: '100dvh',
    background: 'linear-gradient(180deg, #FFF8F0 0%, #F5EEFF 100%)',
    fontFamily: "'Nunito', sans-serif",
  },
  header: { marginBottom: '16px' },
  title: {
    fontSize: '28px',
    fontFamily: "'Fredoka', sans-serif",
    fontWeight: 600,
    color: '#2D1B33',
  },
  tabsWrapper: { overflowX: 'auto', marginBottom: '16px', paddingBottom: '4px' },
  tabs: { display: 'flex', gap: '8px', width: 'max-content' },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '9999px',
    fontSize: '13px',
    fontWeight: 700,
    fontFamily: "'Nunito', sans-serif",
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
    minHeight: '44px',
  },
  noHabits: {
    textAlign: 'center',
    padding: '28px',
    background: '#fff',
    borderRadius: '20px',
    border: '3px solid rgba(201,177,255,0.2)',
    marginBottom: '16px',
    boxShadow: '3px 3px 8px rgba(0,0,0,0.06)',
  },
  monthNav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  navBtn: {
    background: '#fff',
    border: '3px solid rgba(0,0,0,0.08)',
    borderRadius: '12px',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '3px 3px 8px rgba(0,0,0,0.08), inset -1px -1px 3px rgba(0,0,0,0.04)',
    transition: 'transform 0.15s ease',
  },
  monthInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  monthText: {
    fontSize: '17px',
    fontFamily: "'Fredoka', sans-serif",
    fontWeight: 600,
    color: '#2D1B33',
    margin: 0,
  },
  monthBadge: {
    fontSize: '12px',
    fontWeight: 700,
    padding: '2px 12px',
    borderRadius: '9999px',
  },
  monthProgressWrap: {
    marginBottom: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  monthProgressTrack: {
    height: '6px',
    background: 'rgba(0,0,0,0.06)',
    borderRadius: '9999px',
    overflow: 'hidden',
  },
  monthProgressFill: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 0.6s ease',
  },
  calendarCard: {
    background: '#fff',
    borderRadius: '24px',
    padding: '16px',
    border: '3px solid rgba(0,0,0,0.06)',
    boxShadow: '4px 4px 16px rgba(0,0,0,0.08), inset -2px -2px 6px rgba(0,0,0,0.03)',
    marginBottom: '16px',
  },
  weekdayRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    marginBottom: '8px',
  },
  weekdayCell: {
    textAlign: 'center',
    fontSize: '11px',
    fontWeight: 800,
    padding: '4px 0',
    letterSpacing: '0.5px',
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '3px',
  },
  dayCell: {
    aspectRatio: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1px',
    borderRadius: '10px',
    transition: 'all 0.15s ease',
    gap: '1px',
  },
  detailCard: {
    borderRadius: '20px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '3px 3px 8px rgba(0,0,0,0.07)',
  },
  detailDate: {
    fontSize: '13px',
    fontWeight: 800,
    color: '#7A6280',
    margin: '0 0 10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  statCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '18px 16px',
    textAlign: 'center',
    border: '3px solid rgba(0,0,0,0.06)',
    boxShadow: '4px 4px 12px rgba(0,0,0,0.07), inset -2px -2px 6px rgba(0,0,0,0.03)',
  },
  statNum: {
    fontSize: '28px',
    fontFamily: "'Fredoka', sans-serif",
    fontWeight: 600,
    margin: '0 0 4px',
  },
  statLabel: { fontSize: '12px', color: '#B0A0B8', fontWeight: 700, margin: 0 },
};
