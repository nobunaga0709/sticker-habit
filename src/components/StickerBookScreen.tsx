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

const RARITY_BADGE_STYLE: Record<string, React.CSSProperties> = {
  normal: { background: '#B0A0B8', color: '#fff' },
  rare: { background: 'linear-gradient(135deg, #42A5F5, #1976D2)', color: '#fff' },
  superRare: { background: 'linear-gradient(135deg, #FFD93D, #FF6B9D)', color: '#fff' },
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

  const selectedUS = selectedId ? userStickers.find(us => us.id === selectedId) : null;
  const selectedSticker = selectedUS ? STICKER_MAP[selectedUS.stickerId] : null;

  const stats = {
    total: userStickers.length,
    unused: userStickers.filter(us => !us.isUsed).length,
    used: userStickers.filter(us => us.isUsed).length,
    unique: new Set(userStickers.map(us => us.stickerId)).size,
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>シール帳</h1>
        <div style={styles.collectionBadge}>
          <span style={styles.collBig}>{stats.unique}</span>
          <span style={styles.collSmall}>/ {PRESET_STICKERS.length}種</span>
        </div>
      </div>

      {/* Stats bar */}
      <div style={styles.statsBar}>
        {[
          { label: '所持', value: stats.total, color: '#FF6B9D' },
          { label: '未使用', value: stats.unused, color: '#6BCB77' },
          { label: '使用済', value: stats.used, color: '#B0A0B8' },
        ].map(s => (
          <div key={s.label} style={styles.statBox}>
            <span style={{ ...styles.statNum, color: s.color }}>{s.value}</span>
            <span style={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={styles.filterRow}>
        {(['all', 'unused', 'used'] as FilterType[]).map(f => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...styles.filterBtn,
                background: active ? '#FF6B9D' : '#fff',
                color: active ? '#fff' : '#7A6280',
                border: `3px solid ${active ? '#FF6B9D' : 'rgba(0,0,0,0.08)'}`,
                boxShadow: active
                  ? '3px 3px 8px rgba(255,107,157,0.3), inset -1px -1px 4px rgba(0,0,0,0.06)'
                  : '3px 3px 8px rgba(0,0,0,0.06), inset -1px -1px 3px rgba(0,0,0,0.03)',
              }}
            >
              {f === 'all' ? `すべて (${stats.total})` :
               f === 'unused' ? `未使用 (${stats.unused})` :
               `使用済み (${stats.used})`}
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={styles.progressWrap}>
        <div style={styles.progressTrack}>
          <div style={{
            ...styles.progressFill,
            width: `${PRESET_STICKERS.length > 0 ? (stats.unique / PRESET_STICKERS.length) * 100 : 0}%`,
          }} />
        </div>
        <span style={styles.progressLabel}>コレクション進捗 {Math.round(stats.unique / PRESET_STICKERS.length * 100)}%</span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C9B1FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ color: '#7A6280', fontWeight: 700, margin: 0 }}>
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
            const selected = us.id === selectedId;
            return (
              <button
                key={us.id}
                onClick={() => setSelectedId(selected ? null : us.id)}
                aria-label={`${sticker.name} ${us.isUsed ? '使用済み' : '未使用'}`}
                style={{
                  ...styles.stickerCard,
                  background: sticker.color,
                  border: selected
                    ? '3px solid #FF6B9D'
                    : '3px solid rgba(255,255,255,0.7)',
                  boxShadow: selected
                    ? '4px 4px 12px rgba(255,107,157,0.35), inset -2px -2px 6px rgba(0,0,0,0.06)'
                    : '3px 3px 8px rgba(0,0,0,0.10), inset -1px -1px 4px rgba(0,0,0,0.05)',
                  opacity: us.isUsed ? 0.65 : 1,
                  transform: selected ? 'scale(1.04)' : 'scale(1)',
                  cursor: 'pointer',
                }}
              >
                <span style={styles.stickerEmoji}>{sticker.emoji}</span>
                <span style={styles.stickerName}>{sticker.name}</span>
                <span style={{ ...styles.rarityDot, ...RARITY_BADGE_STYLE[sticker.rarity] }}>
                  {RARITY_LABEL[sticker.rarity]}
                </span>
                {us.isUsed && (
                  <div style={styles.usedOverlay}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {selectedSticker && selectedUS && (
        <div
          style={styles.overlay}
          onClick={() => setSelectedId(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedSticker.name} 詳細`}
        >
          <div
            style={{
              ...styles.modal,
              background: selectedSticker.color,
              border: `3px solid rgba(255,255,255,0.7)`,
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              style={styles.closeBtn}
              onClick={() => setSelectedId(null)}
              aria-label="閉じる"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7A6280" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div style={styles.modalEmoji}>{selectedSticker.emoji}</div>
            <h2 style={styles.modalName}>{selectedSticker.name}</h2>
            <span style={{
              ...styles.modalRarityBadge,
              ...RARITY_BADGE_STYLE[selectedSticker.rarity],
            }}>
              {selectedSticker.rarity === 'normal' ? 'ノーマル' :
               selectedSticker.rarity === 'rare' ? 'レア' : 'スーパーレア'}
            </span>
            <div style={styles.infoGrid}>
              {[
                { label: '獲得日', value: format(new Date(selectedUS.acquiredAt), 'yyyy年M月d日', { locale: ja }) },
                { label: '状態', value: selectedUS.isUsed ? '使用済み ✓' : '未使用 ✨' },
              ].map(row => (
                <div key={row.label} style={styles.infoRow}>
                  <span style={styles.infoLabel}>{row.label}</span>
                  <span style={styles.infoValue}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
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
    background: 'linear-gradient(180deg, #F5EEFF 0%, #FFF0F6 100%)',
    fontFamily: "'Nunito', sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  title: {
    fontSize: '28px',
    fontFamily: "'Fredoka', sans-serif",
    fontWeight: 600,
    color: '#2D1B33',
  },
  collectionBadge: {
    background: '#fff',
    border: '3px solid #C9B1FF',
    borderRadius: '9999px',
    padding: '4px 14px',
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px',
    boxShadow: '3px 3px 8px rgba(201,177,255,0.25), inset -1px -1px 4px rgba(0,0,0,0.04)',
  },
  collBig: { fontSize: '20px', fontWeight: 800, color: '#C9B1FF', fontFamily: "'Fredoka', sans-serif" },
  collSmall: { fontSize: '12px', color: '#B0A0B8', fontWeight: 600 },
  statsBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '16px',
  },
  statBox: {
    flex: 1,
    background: '#fff',
    borderRadius: '16px',
    border: '3px solid rgba(0,0,0,0.06)',
    padding: '10px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    boxShadow: '3px 3px 8px rgba(0,0,0,0.07), inset -1px -1px 4px rgba(0,0,0,0.04)',
  },
  statNum: { fontSize: '22px', fontWeight: 800, fontFamily: "'Fredoka', sans-serif" },
  statLabel: { fontSize: '11px', color: '#B0A0B8', fontWeight: 600 },
  filterRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '14px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  filterBtn: {
    borderRadius: '9999px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 700,
    fontFamily: "'Nunito', sans-serif",
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
    minHeight: '44px',
  },
  progressWrap: {
    marginBottom: '16px',
  },
  progressTrack: {
    height: '8px',
    background: 'rgba(201,177,255,0.25)',
    borderRadius: '9999px',
    overflow: 'hidden',
    border: '2px solid rgba(201,177,255,0.3)',
    marginBottom: '4px',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #C9B1FF, #FF6B9D)',
    borderRadius: '9999px',
    transition: 'width 0.6s ease',
  },
  progressLabel: {
    fontSize: '11px',
    color: '#B0A0B8',
    fontWeight: 600,
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
    background: '#fff',
    borderRadius: '24px',
    border: '3px solid rgba(201,177,255,0.3)',
    boxShadow: '4px 4px 12px rgba(0,0,0,0.06), inset -2px -2px 6px rgba(0,0,0,0.03)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  stickerCard: {
    borderRadius: '20px',
    padding: '16px 8px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    position: 'relative',
    transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease',
    minHeight: '100px',
  },
  stickerEmoji: { fontSize: '38px', lineHeight: 1, marginBottom: '2px' },
  stickerName: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#2D1B33',
    textAlign: 'center',
    lineHeight: 1.2,
  },
  rarityDot: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '9px',
    fontWeight: 800,
  },
  usedOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(45,27,51,0.35)',
    borderRadius: '17px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(45,27,51,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px',
    backdropFilter: 'blur(4px)',
  },
  modal: {
    borderRadius: '28px',
    padding: '36px 24px 28px',
    width: '100%',
    maxWidth: '320px',
    textAlign: 'center',
    position: 'relative',
    boxShadow: '8px 8px 32px rgba(0,0,0,0.25), inset -3px -3px 8px rgba(0,0,0,0.06)',
    animation: 'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(255,255,255,0.8)',
    border: '2px solid rgba(0,0,0,0.08)',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalEmoji: { fontSize: '72px', lineHeight: 1, marginBottom: '12px' },
  modalName: {
    fontSize: '22px',
    fontFamily: "'Fredoka', sans-serif",
    fontWeight: 600,
    margin: '0 0 8px',
    color: '#2D1B33',
  },
  modalRarityBadge: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: 700,
    padding: '5px 16px',
    borderRadius: '9999px',
    marginBottom: '20px',
    letterSpacing: '0.5px',
  },
  infoGrid: {
    background: 'rgba(255,255,255,0.65)',
    borderRadius: '16px',
    padding: '4px 16px',
    border: '2px solid rgba(255,255,255,0.8)',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    fontSize: '14px',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
  },
  infoLabel: { color: '#7A6280', fontWeight: 600 },
  infoValue: { fontWeight: 700, color: '#2D1B33' },
};
