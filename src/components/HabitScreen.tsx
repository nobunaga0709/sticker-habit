import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { STICKER_MAP } from '../data/presetStickers';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const HABIT_ICONS = ['💪', '📚', '🏃', '🧘', '💧', '🥗', '😴', '🎵', '✍️', '🌿', '🎨', '🧹'];
const HABIT_COLORS = [
  '#FF6EC4', '#FF8A65', '#66BB6A', '#42A5F5',
  '#AB47BC', '#FFA726', '#26C6DA', '#EC407A',
];

interface StickerPickerProps {
  onSelect: (userStickerId: string, stickerId: string) => void;
  onClose: () => void;
}

function StickerPicker({ onSelect, onClose }: StickerPickerProps) {
  const { getAvailableStickers } = useAppStore();
  const available = getAvailableStickers();

  return (
    <div style={pickerStyles.overlay} onClick={onClose}>
      <div style={pickerStyles.sheet} onClick={e => e.stopPropagation()}>
        <div style={pickerStyles.handle} />
        <h3 style={pickerStyles.title}>シールを選んで貼ろう！ 🎀</h3>
        {available.length === 0 ? (
          <div style={pickerStyles.empty}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>📭</div>
            <p style={{ color: '#888', margin: 0 }}>未使用のシールがありません</p>
            <p style={{ color: '#aaa', fontSize: '13px', margin: '4px 0 0' }}>ガチャを回してシールをゲットしよう！</p>
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
                  style={{ ...pickerStyles.item, background: sticker.color }}
                >
                  <span style={{ fontSize: '36px' }}>{sticker.emoji}</span>
                  <span style={{ fontSize: '11px', color: '#555', fontWeight: 600 }}>{sticker.name}</span>
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
    <div style={formStyles.overlay} onClick={onClose}>
      <div style={formStyles.sheet} onClick={e => e.stopPropagation()}>
        <div style={formStyles.handle} />
        <h3 style={formStyles.title}>新しい習慣を追加</h3>

        <div style={formStyles.field}>
          <label style={formStyles.label}>習慣名</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例: 毎日運動する"
            style={formStyles.input}
            maxLength={30}
            autoFocus
          />
        </div>

        <div style={formStyles.field}>
          <label style={formStyles.label}>アイコン</label>
          <div style={formStyles.iconGrid}>
            {HABIT_ICONS.map(icon => (
              <button
                key={icon}
                onClick={() => setSelectedIcon(icon)}
                style={{
                  ...formStyles.iconBtn,
                  background: selectedIcon === icon ? '#ff6ec4' : '#f5f5f5',
                  transform: selectedIcon === icon ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div style={formStyles.field}>
          <label style={formStyles.label}>カラー</label>
          <div style={formStyles.colorRow}>
            {HABIT_COLORS.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                style={{
                  ...formStyles.colorDot,
                  background: color,
                  border: selectedColor === color ? '3px solid #333' : '3px solid transparent',
                  transform: selectedColor === color ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button onClick={onClose} style={formStyles.cancelBtn}>キャンセル</button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            style={{
              ...formStyles.submitBtn,
              opacity: name.trim() ? 1 : 0.5,
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
  const [longPressId, setLongPressId] = useState<string | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

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
      <div style={styles.header}>
        <h1 style={styles.title}>✅ 習慣</h1>
        <div style={styles.dateLabel}>
          {format(new Date(), 'M月d日 (E)', { locale: ja })}
        </div>
      </div>

      {habits.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🌱</div>
          <p style={{ fontWeight: 700, color: '#555', marginBottom: '8px' }}>習慣を作ってみよう！</p>
          <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>毎日続けることで素敵なシールを貼れるよ</p>
        </div>
      ) : (
        <div style={styles.habitList}>
          {habits.map(habit => {
            const done = hasRecordToday(habit.id);
            const isLongPress = longPressId === habit.id;
            return (
              <div
                key={habit.id}
                style={{
                  ...styles.habitCard,
                  borderLeft: `4px solid ${habit.color}`,
                  background: done ? `${habit.color}18` : '#fff',
                }}
              >
                <div style={styles.habitLeft}>
                  <div style={{
                    ...styles.habitIcon,
                    background: `${habit.color}25`,
                  }}>
                    {habit.icon}
                  </div>
                  <div style={styles.habitInfo}>
                    <div style={styles.habitName}>{habit.name}</div>
                    <div style={styles.habitStats}>
                      <span style={{ color: habit.color, fontWeight: 600 }}>
                        🔥 {habit.streak}日連続
                      </span>
                      <span style={styles.statSep}>·</span>
                      <span style={{ color: '#999' }}>計{habit.totalDays}日</span>
                    </div>
                  </div>
                </div>
                <div style={styles.habitRight}>
                  {isLongPress ? (
                    <button
                      onClick={() => { deleteHabit(habit.id); setLongPressId(null); }}
                      style={styles.deleteBtn}
                    >
                      削除
                    </button>
                  ) : (
                    <button
                      onClick={() => done ? null : handleAchieve(habit.id)}
                      onDoubleClick={() => setLongPressId(isLongPress ? null : habit.id)}
                      style={{
                        ...styles.achieveBtn,
                        background: done ? habit.color : '#f5f5f5',
                        color: done ? '#fff' : '#999',
                        cursor: done ? 'default' : 'pointer',
                      }}
                      title={done ? '今日は達成済み！' : 'タップして達成'}
                    >
                      {done ? '✓ 達成！' : '達成する'}
                    </button>
                  )}
                  {isLongPress && (
                    <button
                      onClick={() => setLongPressId(null)}
                      style={{ ...styles.cancelDeleteBtn }}
                    >
                      戻る
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button onClick={() => setShowAdd(true)} style={styles.addBtn}>
        ＋ 習慣を追加
      </button>

      <p style={styles.hint}>※ 習慣カードをダブルクリックすると削除ボタンが表示されます</p>

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
    padding: '24px 20px',
    maxWidth: '480px',
    margin: '0 auto',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #f0fff4 0%, #fef6ff 100%)',
    fontFamily: '"Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '28px',
  },
  title: { fontSize: '24px', fontWeight: 700, margin: 0, color: '#333' },
  dateLabel: {
    fontSize: '14px',
    color: '#888',
    background: '#fff',
    padding: '6px 12px',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: '#fff',
    borderRadius: '20px',
    marginBottom: '20px',
  },
  habitList: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' },
  habitCard: {
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    transition: 'all 0.2s ease',
  },
  habitLeft: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 },
  habitIcon: {
    width: '44px', height: '44px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
    flexShrink: 0,
  },
  habitInfo: { flex: 1, minWidth: 0 },
  habitName: { fontSize: '15px', fontWeight: 700, color: '#333', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  habitStats: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' },
  statSep: { color: '#ddd' },
  habitRight: { display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '12px', flexShrink: 0 },
  achieveBtn: {
    borderRadius: '20px', padding: '8px 16px',
    fontSize: '13px', fontWeight: 700, border: 'none',
    transition: 'all 0.2s ease', whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  deleteBtn: {
    background: '#ff5252', color: '#fff', border: 'none',
    borderRadius: '16px', padding: '6px 14px', fontSize: '13px',
    fontWeight: 700, cursor: 'pointer',
  },
  cancelDeleteBtn: {
    background: '#f5f5f5', color: '#888', border: 'none',
    borderRadius: '16px', padding: '4px 10px', fontSize: '12px',
    cursor: 'pointer',
  },
  addBtn: {
    width: '100%', padding: '16px',
    background: 'linear-gradient(135deg, #ff6ec4, #c850c0)',
    color: '#fff', border: 'none', borderRadius: '16px',
    fontSize: '16px', fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(200,80,192,0.3)',
    marginBottom: '12px',
  },
  hint: { textAlign: 'center', color: '#bbb', fontSize: '12px', margin: 0 },
};

const pickerStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000,
  },
  sheet: {
    background: '#fff', width: '100%', maxWidth: '480px',
    borderRadius: '24px 24px 0 0', padding: '12px 20px 40px',
    maxHeight: '70vh', overflowY: 'auto',
    animation: 'slideUp 0.3s ease',
  },
  handle: {
    width: '36px', height: '4px', background: '#ddd',
    borderRadius: '2px', margin: '0 auto 16px', 
  },
  title: { fontSize: '18px', fontWeight: 700, margin: '0 0 16px', textAlign: 'center', color: '#333' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
  item: {
    borderRadius: '14px', padding: '10px 4px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '4px', border: '2px solid transparent', cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  empty: { textAlign: 'center', padding: '40px 20px' },
};

const formStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000,
  },
  sheet: {
    background: '#fff', width: '100%', maxWidth: '480px',
    borderRadius: '24px 24px 0 0', padding: '12px 20px 40px',
  },
  handle: {
    width: '36px', height: '4px', background: '#ddd',
    borderRadius: '2px', margin: '0 auto 16px',
  },
  title: { fontSize: '18px', fontWeight: 700, margin: '0 0 20px', textAlign: 'center', color: '#333' },
  field: { marginBottom: '16px' },
  label: { fontSize: '13px', fontWeight: 600, color: '#888', display: 'block', marginBottom: '8px' },
  input: {
    width: '100%', padding: '12px 14px',
    fontSize: '15px', border: '2px solid #e0e0e0',
    borderRadius: '12px', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  iconGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' },
  iconBtn: {
    borderRadius: '12px', padding: '8px', fontSize: '22px',
    border: 'none', cursor: 'pointer', transition: 'all 0.15s ease',
  },
  colorRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  colorDot: {
    width: '32px', height: '32px', borderRadius: '50%',
    cursor: 'pointer', transition: 'all 0.15s ease',
  },
  cancelBtn: {
    flex: 1, padding: '14px',
    background: '#f5f5f5', color: '#888',
    border: 'none', borderRadius: '12px', fontSize: '15px',
    fontWeight: 700, cursor: 'pointer',
  },
  submitBtn: {
    flex: 2, padding: '14px',
    background: 'linear-gradient(135deg, #ff6ec4, #c850c0)',
    color: '#fff', border: 'none', borderRadius: '12px',
    fontSize: '15px', fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(200,80,192,0.3)',
  },
};
