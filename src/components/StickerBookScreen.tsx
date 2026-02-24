import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { STICKER_MAP, PRESET_STICKERS } from '../data/presetStickers';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

type FilterType = 'all' | 'unused' | 'used';

const RARITY_LABEL: Record<string, string> = {
  normal: 'N',
  rare: 'R',
  superRare: 'SR',
};

const RARITY_COLOR: Record<string, string> = {
  normal: '#9e9e9e',
  rare: '#42a5f5',
  superRare: '#ffd600',
};

export default function StickerBookScreen() {
  const { userStickers } = useAppStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = userStickers.filter(us => {
    if (filter === 'unused') return !us.isUsed;
    if (filter === 'used') return us.isUsed;
    return true;
  });

  const selectedUserSticker = selectedId ? userStickers.find(us => us.id === selectedId) : null;
  const selectedSticker = selectedUserSticker ? STICKER_MAP[selectedUserSticker.stickerId] : null;

  const stats = {
    total: userStickers.length,
    unused: userStickers.filter(us => !us.isUsed).length,
    used: userStickers.filter(us => us.isUsed).length,
    unique: new Set(userStickers.map(us => us.stickerId)).size,
    collection: PRESET_STICKERS.length,
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📚 シール帳</h1>
        <div style={styles.statsRow}>
          <span style={styles.statItem}>
            <span style={styles.statNum}>{stats.unique}</span>
            <span style={styles.statLabel}>/{stats.collection}種類</span>
          </span>
          <span style={styles.statDivider}>|</span>
          <span style={styles.statItem}>
            <span style={styles.statNum}>{stats.total}</span>
            <span style={styles.statLabel}>枚所持</span>
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterRow}>
        {(['all', 'unused', 'used'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...styles.filterBtn,
              background: filter === f ? '#ff6ec4' : '#fff',
              color: filter === f ? '#fff' : '#888',
              border: filter === f ? '2px solid #ff6ec4' : '2px solid #e0e0e0',
            }}
          >
            {f === 'all' ? `すべて (${stats.total})` :
             f === 'unused' ? `未使用 (${stats.unused})` :
             `使用済み (${stats.used})`}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '60px', marginBottom: '12px' }}>📭</div>
          <p style={{ color: '#888', margin: 0 }}>
            {filter === 'all' ? 'ガチャを回してシールを集めよう！' :
             filter === 'unused' ? '未使用のシールはありません' :
             '使用済みのシールはありません'}
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map(us => {
            const sticker = STICKER_MAP[us.stickerId];
            if (!sticker) return null;
            return (
              <button
                key={us.id}
                onClick={() => setSelectedId(us.id === selectedId ? null : us.id)}
                style={{
                  ...styles.stickerCard,
                  background: sticker.color,
                  border: us.id === selectedId ? '3px solid #ff6ec4' : '2px solid transparent',
                  opacity: us.isUsed ? 0.6 : 1,
                  boxShadow: us.id === selectedId
                    ? '0 4px 16px rgba(255,110,196,0.4)'
                    : '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <div style={styles.stickerEmoji}>{sticker.emoji}</div>
                <div style={styles.stickerName}>{sticker.name}</div>
                <div style={{
                  ...styles.rarityDot,
                  background: RARITY_COLOR[sticker.rarity],
                }}>
                  {RARITY_LABEL[sticker.rarity]}
                </div>
                {us.isUsed && (
                  <div style={styles.usedBadge}>使用済</div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedSticker && selectedUserSticker && (
        <div style={styles.modalOverlay} onClick={() => setSelectedId(null)}>
          <div
            style={{ ...styles.modal, background: selectedSticker.color }}
            onClick={e => e.stopPropagation()}
          >
            <button style={styles.closeBtn} onClick={() => setSelectedId(null)}>✕</button>
            <div style={styles.modalEmoji}>{selectedSticker.emoji}</div>
            <h2 style={styles.modalName}>{selectedSticker.name}</h2>
            <div style={{
              ...styles.modalRarityBadge,
              background: RARITY_COLOR[selectedSticker.rarity],
            }}>
              {RARITY_LABEL[selectedSticker.rarity]}
            </div>
            <div style={styles.modalInfo}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>レアリティ</span>
                <span style={styles.infoValue}>
                  {selectedSticker.rarity === 'normal' ? 'ノーマル' :
                   selectedSticker.rarity === 'rare' ? 'レア' : 'スーパーレア'}
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>獲得日</span>
                <span style={styles.infoValue}>
                  {format(new Date(selectedUserSticker.acquiredAt), 'yyyy年M月d日', { locale: ja })}
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>状態</span>
                <span style={styles.infoValue}>
                  {selectedUserSticker.isUsed ? '使用済み ✓' : '未使用 ✨'}
                </span>
              </div>
            </div>
          </div>
        </div>
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
    background: 'linear-gradient(180deg, #f0f4ff 0%, #fef6ff 100%)',
    fontFamily: '"Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    margin: '0 0 8px',
    color: '#333',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#666',
    fontSize: '13px',
  },
  statItem: { display: 'flex', alignItems: 'baseline', gap: '2px' },
  statNum: { fontSize: '18px', fontWeight: 700, color: '#ff6ec4' },
  statLabel: { fontSize: '12px', color: '#888' },
  statDivider: { color: '#ddd' },
  filterRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  filterBtn: {
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  stickerCard: {
    borderRadius: '16px',
    padding: '16px 8px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    position: 'relative',
    transition: 'all 0.2s ease',
  },
  stickerEmoji: {
    fontSize: '40px',
    lineHeight: 1,
    marginBottom: '4px',
  },
  stickerName: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#444',
    textAlign: 'center',
  },
  rarityDot: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '9px',
    fontWeight: 700,
    color: '#fff',
  },
  usedBadge: {
    position: 'absolute',
    bottom: '4px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.4)',
    color: '#fff',
    fontSize: '9px',
    padding: '2px 6px',
    borderRadius: '8px',
    whiteSpace: 'nowrap',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: '#fff',
    borderRadius: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    borderRadius: '24px',
    padding: '32px 24px',
    width: '100%',
    maxWidth: '320px',
    textAlign: 'center',
    position: 'relative',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(0,0,0,0.1)',
    border: 'none',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalEmoji: { fontSize: '72px', lineHeight: 1, marginBottom: '12px' },
  modalName: { fontSize: '22px', fontWeight: 700, margin: '0 0 8px', color: '#333' },
  modalRarityBadge: {
    display: 'inline-block',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 700,
    padding: '4px 16px',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  modalInfo: {
    background: 'rgba(255,255,255,0.6)',
    borderRadius: '12px',
    padding: '12px 16px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    fontSize: '14px',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  },
  infoLabel: { color: '#888' },
  infoValue: { fontWeight: 600, color: '#444' },
};
