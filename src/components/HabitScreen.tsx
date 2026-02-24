import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { STICKER_MAP } from '../data/presetStickers';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const HABIT_ICONS = ['💪', '📚', '🏃', '🧘', '💧', '🥗', '😴', '🎵', '✍️', '🌿', '🎨', '🧹'];
const HABIT_COLORS = ['#FF6B9D', '#FF8A65', '#66BB6A', '#42A5F5', '#AB47BC', '#FFA726', '#26C6DA', '#EC407A'];

interface StickerPickerProps {
  onSelect: (userStickerId: string, stickerId: string) => void;
  onClose: () => void;
}

function StickerPicker({ onSelect, onClose }: StickerPickerProps) {
  const { getAvailableStickers } = useAppStore();
  const available = getAvailableStickers();

  return (
    <div style={pickerStyles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="シール選択">
      <div style={pickerStyles.sheet} onClick={e => e.stopPropagation()}>
        <div style={pickerStyles.handle} />
        <h3 style={pickerStyles.title}>シールを選んで貼ろう！</h3>
        {available.length === 0 ? (
          <div style={pickerStyles.empty}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C9B1FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 10 }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ color: '#7A6280', fontWeight: 700, margin: 0 }}>未使用のシールがありません</p>
            <p style={{ color: '#B0A0B8', fontSize: '13px', margin: '4px 0 0' }}>ガチャを回してシールをゲットしよう！</p>
          </div>
        ) : (
          <div style={pickerStyles.grid}>
            {available.map(us => {
              const sticker = STICKER_MAP[us.stickerId];
              if (!sticker) return null;
              return (
                <button
                  key={us.id}
                  onClick={() => onSelect(us.id, sticker.id)}
                  aria-label={sticker.name}
                  style={{
                    ...pickerStyles.item,
                    background: sticker.color,
                    border: '3px solid rgba(255,255,255,0.7)',
                    boxShadow: '3px 3px 8px rgba(0,0,0,0.10), inset -1px -1px 4px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '34px', lineHeight: 1 }}>{sticker.emoji}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#2D1B33', textAlign: 'center' }}>{sticker.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface AddHabitFormProps {
  onClose: () => void;
}

function AddHabitForm({ onClose }: AddHabitFormProps) {
  const { addHabit } = useAppStore();
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(HABIT_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    addHabit(name.trim(), selectedIcon, selectedColor);
    onClose();
  };

  return (
    <div style={formStyles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="習慣追加">
      <div style={formStyles.sheet} onClick={e => e.stopPropagation()}>
        <div style={formStyles.handle} />
        <h3 style={formStyles.title}>新しい習慣を追加</h3>

        <div style={formStyles.field}>
          <label htmlFor="habit-name" style={formStyles.label}>習慣名</label>
          <input
            id="habit-name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例: 毎日運動する"
            style={formStyles.input}
            maxLength={30}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
          />
          <span style={formStyles.charCount}>{name.length}/30</span>
        </div>

        <div style={formStyles.field}>
          <p style={formStyles.label}>アイコン</p>
          <div style={formStyles.iconGrid}>
            {HABIT_ICONS.map(icon => (
              <button
                key={icon}
                onClick={() => setSelectedIcon(icon)}
                aria-label={icon}
                style={{
                  ...formStyles.iconBtn,
                  background: selectedIcon === icon ? selectedColor : '#F5EEFF',
                  border: `3px solid ${selectedIcon === icon ? selectedColor : 'rgba(0,0,0,0.08)'}`,
                  boxShadow: selectedIcon === icon
                    ? `3px 3px 8px ${selectedColor}40, inset -1px -1px 4px rgba(0,0,0,0.06)`
                    : '2px 2px 6px rgba(0,0,0,0.07)',
                  transform: selectedIcon === icon ? 'scale(1.15)' : 'scale(1)',
                  cursor: 'pointer',
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div style={formStyles.field}>
          <p style={formStyles.label}>カラー</p>
          <div style={formStyles.colorRow}>
            {HABIT_COLORS.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                aria-label={`カラー ${color}`}
                style={{
                  ...formStyles.colorDot,
                  background: color,
                  border: selectedColor === color ? '4px solid #2D1B33' : '3px solid rgba(255,255,255,0.8)',
                  boxShadow: selectedColor === color
                    ? `3px 3px 8px ${color}60`
                    : '2px 2px 6px rgba(0,0,0,0.12)',
                  transform: selectedColor === color ? 'scale(1.2)' : 'scale(1)',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} style={formStyles.cancelBtn}>キャンセル</button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            style={{
              ...formStyles.submitBtn,
              background: name.trim() ? `linear-gradient(135deg, ${selectedColor}, ${selectedColor}cc)` : '#ddd',
              boxShadow: name.trim() ? `3px 3px 12px ${selectedColor}50` : 'none',
              cursor: name.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            追加する
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HabitScreen() {
  const { habits, hasRecordToday, addHabitRecord, deleteHabit } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [pickingForHabit, setPickingForHabit] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  // JSX内IIFEを避け、変数として事前計算 (rerender-derived-state-no-effect)
  const doneCount = habits.filter(h => hasRecordToday(h.id)).length;
  const progressPct = habits.length > 0 ? Math.round((doneCount / habits.length) * 100) : 0;

  const handleAchieve = (habitId: string) => {
    if (hasRecordToday(habitId)) return;
    setPickingForHabit(habitId);
  };

  const handleStickerSelect = (userStickerId: string, stickerId: string) => {
    if (!pickingForHabit) return;
    addHabitRecord(pickingForHabit, userStickerId, stickerId, today);
    setPickingForHabit(null);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>習慣</h1>
          <p style={styles.dateLabel}>{format(new Date(), 'M月d日 (E)', { locale: ja })}</p>
        </div>
        <div style={styles.headerStats}>
          <span style={styles.headerStatNum}>{habits.length}</span>
          <span style={styles.headerStatLabel}>個の習慣</span>
        </div>
      </div>

      {/* Today's progress */}
      {habits.length > 0 && (
        <div style={styles.progressCard}>
          <div style={styles.progressTop}>
            <span style={styles.progressText}>今日の達成</span>
            <span style={styles.progressFraction}>
              <span style={{ color: '#FF6B9D', fontWeight: 800 }}>{doneCount}</span>
              <span style={{ color: '#B0A0B8' }}> / {habits.length}</span>
            </span>
          </div>
          <div style={styles.progressTrack}>
            <div style={{
              ...styles.progressFill,
              width: `${progressPct}%`,
              background: progressPct === 100
                ? 'linear-gradient(90deg, #6BCB77, #42A5F5)'
                : 'linear-gradient(90deg, #FF6B9D, #C9B1FF)',
            }} />
          </div>
        </div>
      )}

      {/* Habit list */}
      {habits.length === 0 ? (
        <div style={styles.emptyState}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#C9B1FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <p style={{ fontWeight: 700, color: '#7A6280', margin: '0 0 6px' }}>習慣を作ってみよう！</p>
          <p style={{ color: '#B0A0B8', fontSize: '13px', margin: 0 }}>毎日続けることで素敵なシールを貼れるよ</p>
        </div>
      ) : (
        <div style={styles.habitList}>
          {habits.map(habit => {
            const done = hasRecordToday(habit.id);
            const confirming = confirmDeleteId === habit.id;
            return (
              <div
                key={habit.id}
                style={{
                  ...styles.habitCard,
                  borderLeft: `4px solid ${habit.color}`,
                  background: done ? `${habit.color}14` : '#fff',
                  boxShadow: done
                    ? `4px 4px 12px ${habit.color}25, inset -2px -2px 6px rgba(0,0,0,0.04)`
                    : '4px 4px 12px rgba(0,0,0,0.08), inset -2px -2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <div style={styles.habitLeft}>
                  <div style={{
                    ...styles.habitIconBox,
                    background: `${habit.color}20`,
                    border: `3px solid ${habit.color}40`,
                  }}>
                    <span style={{ fontSize: '24px', lineHeight: 1 }}>{habit.icon}</span>
                  </div>
                  <div style={styles.habitInfo}>
                    <p style={styles.habitName}>{habit.name}</p>
                    <div style={styles.habitMeta}>
                      <span style={{ color: habit.color, fontWeight: 700, fontSize: '13px' }}>
                        🔥 {habit.streak}日
                      </span>
                      <span style={{ color: '#ddd', fontSize: '12px' }}>·</span>
                      <span style={{ color: '#B0A0B8', fontSize: '13px', fontWeight: 600 }}>計 {habit.totalDays}日</span>
                    </div>
                  </div>
                </div>

                <div style={styles.habitRight}>
                  {confirming ? (
                    <>
                      <button
                        onClick={() => { deleteHabit(habit.id); setConfirmDeleteId(null); }}
                        style={styles.deleteConfirmBtn}
                      >削除</button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        style={styles.cancelDeleteBtn}
                      >戻る</button>
                    </>
                  ) : done ? (
                    <div style={{ ...styles.doneChip, background: habit.color }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span>達成！</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAchieve(habit.id)}
                      style={{
                        ...styles.achieveBtn,
                        background: `linear-gradient(135deg, ${habit.color}, ${habit.color}cc)`,
                        boxShadow: `3px 3px 10px ${habit.color}40, inset -1px -1px 4px rgba(0,0,0,0.07)`,
                        cursor: 'pointer',
                      }}
                    >
                      達成する
                    </button>
                  )}
                  {!confirming && (
                    <button
                      onClick={() => setConfirmDeleteId(confirming ? null : habit.id)}
                      aria-label="削除"
                      style={styles.menuBtn}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B0A0B8" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add button */}
      <button
        onClick={() => setShowAdd(true)}
        style={styles.addBtn}
        aria-label="習慣を追加"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        習慣を追加する
      </button>

      {showAdd && <AddHabitForm onClose={() => setShowAdd(false)} />}
      {pickingForHabit && (
        <StickerPicker
          onSelect={handleStickerSelect}
          onClose={() => setPickingForHabit(null)}
        />
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
    background: 'linear-gradient(180deg, #F0FFF4 0%, #FFF0F6 100%)',
    fontFamily: "'Nunito', sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  title: {
    fontSize: '28px',
    fontFamily: "'Fredoka', sans-serif",
    fontWeight: 600,
    color: '#2D1B33',
    lineHeight: 1,
    marginBottom: '4px',
  },
  dateLabel: { fontSize: '13px', color: '#B0A0B8', fontWeight: 600 },
  headerStats: {
    background: '#fff',
    border: '3px solid rgba(107,203,119,0.4)',
    borderRadius: '9999px',
    padding: '6px 14px',
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    boxShadow: '3px 3px 8px rgba(107,203,119,0.15), inset -1px -1px 4px rgba(0,0,0,0.04)',
  },
  headerStatNum: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#6BCB77',
    fontFamily: "'Fredoka', sans-serif",
  },
  headerStatLabel: { fontSize: '12px', color: '#B0A0B8', fontWeight: 600 },
  progressCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '14px 16px',
    marginBottom: '20px',
    border: '3px solid rgba(255,107,157,0.15)',
    boxShadow: '4px 4px 12px rgba(0,0,0,0.07), inset -2px -2px 6px rgba(0,0,0,0.03)',
  },
  progressTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  progressText: { fontSize: '13px', fontWeight: 700, color: '#7A6280' },
  progressFraction: { fontSize: '16px', fontFamily: "'Fredoka', sans-serif" },
  progressTrack: {
    height: '8px',
    background: 'rgba(255,107,157,0.12)',
    borderRadius: '9999px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 0.5s ease',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
    background: '#fff',
    borderRadius: '24px',
    border: '3px solid rgba(201,177,255,0.25)',
    boxShadow: '4px 4px 12px rgba(0,0,0,0.06), inset -2px -2px 6px rgba(0,0,0,0.03)',
    marginBottom: '20px',
  },
  habitList: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' },
  habitCard: {
    borderRadius: '20px',
    padding: '14px 14px 14px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'transform 0.15s ease',
    border: '3px solid rgba(255,255,255,0.8)',
  },
  habitLeft: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 },
  habitIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  habitInfo: { flex: 1, minWidth: 0 },
  habitName: {
    fontSize: '15px',
    fontWeight: 800,
    color: '#2D1B33',
    margin: '0 0 4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  habitMeta: { display: 'flex', alignItems: 'center', gap: '6px' },
  habitRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
    marginLeft: '10px',
    flexShrink: 0,
  },
  achieveBtn: {
    border: 'none',
    borderRadius: '9999px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: 800,
    color: '#fff',
    fontFamily: "'Nunito', sans-serif",
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    minHeight: '44px',
    whiteSpace: 'nowrap',
  },
  doneChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    borderRadius: '9999px',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: 800,
    color: '#fff',
    minHeight: '44px',
  },
  deleteConfirmBtn: {
    background: '#FF5252',
    color: '#fff',
    border: 'none',
    borderRadius: '9999px',
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
  },
  cancelDeleteBtn: {
    background: '#F5EEFF',
    color: '#7A6280',
    border: 'none',
    borderRadius: '9999px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
  },
  menuBtn: {
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    padding: '4px 6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '32px',
    minWidth: '32px',
  },
  addBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #FF6B9D, #C9B1FF)',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    fontSize: '16px',
    fontWeight: 800,
    fontFamily: "'Fredoka', sans-serif",
    letterSpacing: '0.3px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '4px 4px 16px rgba(255,107,157,0.35), inset -2px -2px 6px rgba(0,0,0,0.07)',
    minHeight: '56px',
    transition: 'transform 0.15s ease',
  },
};

const pickerStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(45,27,51,0.55)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  sheet: {
    background: '#fff',
    width: '100%',
    maxWidth: '480px',
    borderRadius: '28px 28px 0 0',
    padding: '12px 20px 40px',
    maxHeight: '70vh',
    overflowY: 'auto',
    border: '3px solid rgba(255,107,157,0.2)',
    borderBottom: 'none',
    boxShadow: '0 -8px 32px rgba(0,0,0,0.15)',
    animation: 'slideUp 0.3s ease',
  },
  handle: {
    width: '40px',
    height: '5px',
    background: '#EDE4F7',
    borderRadius: '9999px',
    margin: '0 auto 16px',
  },
  title: {
    fontSize: '20px',
    fontFamily: "'Fredoka', sans-serif",
    fontWeight: 600,
    margin: '0 0 16px',
    textAlign: 'center',
    color: '#2D1B33',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
  item: {
    borderRadius: '16px',
    padding: '12px 4px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1)',
    minHeight: '72px',
  },
  empty: { textAlign: 'center', padding: '32px 16px' },
};

const formStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(45,27,51,0.55)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  sheet: {
    background: '#fff',
    width: '100%',
    maxWidth: '480px',
    borderRadius: '28px 28px 0 0',
    padding: '12px 24px 40px',
    border: '3px solid rgba(201,177,255,0.3)',
    borderBottom: 'none',
    boxShadow: '0 -8px 32px rgba(0,0,0,0.15)',
    animation: 'slideUp 0.3s ease',
  },
  handle: {
    width: '40px',
    height: '5px',
    background: '#EDE4F7',
    borderRadius: '9999px',
    margin: '0 auto 20px',
  },
  title: {
    fontSize: '20px',
    fontFamily: "'Fredoka', sans-serif",
    fontWeight: 600,
    margin: '0 0 20px',
    textAlign: 'center',
    color: '#2D1B33',
  },
  field: { marginBottom: '20px', position: 'relative' },
  label: { fontSize: '12px', fontWeight: 700, color: '#B0A0B8', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '16px',
    border: '3px solid rgba(201,177,255,0.4)',
    borderRadius: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 600,
    color: '#2D1B33',
    boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.05)',
    transition: 'border-color 0.2s ease',
  },
  charCount: {
    position: 'absolute',
    bottom: 10,
    right: 14,
    fontSize: '11px',
    color: '#B0A0B8',
    fontWeight: 600,
  },
  iconGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' },
  iconBtn: {
    borderRadius: '12px',
    padding: '8px',
    fontSize: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
    minHeight: '44px',
    minWidth: '44px',
  },
  colorRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  colorDot: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    transition: 'all 0.15s ease',
  },
  cancelBtn: {
    flex: 1,
    padding: '14px',
    background: '#F5EEFF',
    color: '#7A6280',
    border: '3px solid rgba(201,177,255,0.3)',
    borderRadius: '16px',
    fontSize: '15px',
    fontWeight: 700,
    fontFamily: "'Nunito', sans-serif",
    cursor: 'pointer',
    minHeight: '52px',
  },
  submitBtn: {
    flex: 2,
    padding: '14px',
    color: '#fff',
    border: 'none',
    borderRadius: '16px',
    fontSize: '15px',
    fontWeight: 800,
    fontFamily: "'Fredoka', sans-serif",
    letterSpacing: '0.3px',
    transition: 'all 0.2s ease',
    minHeight: '52px',
  },
};
