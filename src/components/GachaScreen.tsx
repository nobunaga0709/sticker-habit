import { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { STICKER_MAP } from '../data/presetStickers';
import type { UserSticker } from '../types';

const RARITY_LABEL: Record<string, string> = {
  normal: 'ノーマル',
  rare: 'レア ✦',
  superRare: 'SUPER RARE ✦✦✦',
};

const RARITY_BADGE: Record<string, React.CSSProperties> = {
  normal: { background: '#B0A0B8', color: '#fff' },
  rare: { background: 'linear-gradient(135deg, #42A5F5, #1976D2)', color: '#fff' },
  superRare: {
    background: 'linear-gradient(135deg, #FFD93D, #FF6B9D, #C9B1FF)',
    color: '#fff',
    boxShadow: '0 2px 12px rgba(255,107,157,0.5)',
  },
};

const RARITY_CARD: Record<string, React.CSSProperties> = {
  normal: {
    background: 'linear-gradient(145deg, #F8F0FF, #EDE4F7)',
    border: '3px solid #C9B1FF',
  },
  rare: {
    background: 'linear-gradient(145deg, #E3F2FD, #BBDEFB)',
    border: '3px solid #42A5F5',
  },
  superRare: {
    background: 'linear-gradient(145deg, #FFF9E6, #FFE0F0)',
    border: '3px solid #FFD93D',
  },
};

export default function GachaScreen() {
  const { gachaTicket, drawGachaTicket, canDrawGacha, userStickers } = useAppStore();
  const [result, setResult] = useState<UserSticker | null>(null);
  const [animating, setAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [pressing, setPressing] = useState(false);

  const totalStickers = 21; // PRESET_STICKERS.length
  // userStickersが変化したときのみSet再計算 (rerender-memo)
  const ownedCount = useMemo(
    () => new Set(userStickers.map(us => us.stickerId)).size,
    [userStickers]
  );
  const isComplete = ownedCount >= totalStickers;

  const handleGacha = () => {
    if (!canDrawGacha() || animating || isComplete) return;
    setShowResult(false);
    setAnimating(true);

    setTimeout(() => {
      const newSticker = drawGachaTicket();
      setResult(newSticker);
      setAnimating(false);
      setShowResult(true);
    }, 1400);
  };

  const resultSticker = result ? STICKER_MAP[result.stickerId] : null;
  const canDraw = canDrawGacha() && !isComplete;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>ガチャ</h1>
        <div style={styles.ticketBadge}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B9D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          <span style={styles.ticketCount}>{gachaTicket.count}</span>
          <span style={styles.ticketLabel}>枚</span>
        </div>
      </div>

      {/* Gacha Machine */}
      <div style={styles.machineOuter}>
        {/* Decorative dots */}
        <div style={{ ...styles.deco, top: 12, left: 16, background: '#FFD93D' }} />
        <div style={{ ...styles.deco, top: 20, right: 24, background: '#6BCB77' }} />
        <div style={{ ...styles.deco, bottom: 24, left: 24, background: '#C9B1FF' }} />

        <div style={styles.machine}>
          {/* Top cap */}
          <div style={styles.machineCap}>
            <div style={styles.capKnob} />
          </div>

          {/* Sphere window */}
          <div style={{
            ...styles.sphereOuter,
            animation: animating ? 'spin 0.6s linear infinite' : 'none',
          }}>
            <div style={styles.sphere}>
              <div style={styles.sphereShine} />
              {animating ? (
                <div style={styles.spinGroup}>
                  {['⭐', '❤️', '🌸', '✨', '🦄', '🎀'].map((e, i) => (
                    <span key={i} style={{
                      position: 'absolute',
                      fontSize: '28px',
                      animation: `floatUp ${0.5 + i * 0.15}s ease-out infinite`,
                      left: `${10 + i * 14}%`,
                      top: '50%',
                    }}>{e}</span>
                  ))}
                </div>
              ) : showResult && resultSticker ? (
                <span style={{ fontSize: '72px', lineHeight: 1, animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
                  {resultSticker.emoji}
                </span>
              ) : (
                <span style={{ fontSize: '52px', opacity: 0.2 }}>🎁</span>
              )}
            </div>
          </div>

          {/* Body */}
          <div style={styles.machineBody}>
            <div style={styles.machineStripes}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ ...styles.stripe, background: i % 2 === 0 ? 'rgba(255,255,255,0.25)' : 'transparent' }} />
              ))}
            </div>
            <button
              onClick={handleGacha}
              onMouseDown={() => setPressing(true)}
              onMouseUp={() => setPressing(false)}
              onMouseLeave={() => setPressing(false)}
              disabled={!canDraw || animating}
              aria-label={canDraw ? 'ガチャを回す' : 'ガチャ券がありません'}
              style={{
                ...styles.gachaBtn,
                ...(!canDraw || animating ? styles.gachaBtnDisabled : {}),
                transform: pressing ? 'translateY(3px) scale(0.97)' : 'translateY(0) scale(1)',
                boxShadow: pressing
                  ? '2px 2px 6px rgba(0,0,0,0.12), inset 2px 2px 6px rgba(0,0,0,0.08)'
                  : '4px 4px 12px rgba(255,107,157,0.4), inset -2px -2px 6px rgba(0,0,0,0.08)',
              }}
            >
              {animating ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  まわってる...
                </span>
              ) : isComplete ? 'コンプリート！' : canDraw ? 'ガチャを回す！' : 'チケットなし'}
            </button>
          </div>

          {/* Base */}
          <div style={styles.machineBase} />
        </div>
      </div>

      {/* Result card */}
      {showResult && resultSticker && (
        <div style={{
          ...styles.resultCard,
          ...RARITY_CARD[resultSticker.rarity],
          animation: 'slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <div style={styles.resultEmoji}>{resultSticker.emoji}</div>
          <h2 style={styles.resultName}>{resultSticker.name}</h2>
          <span style={{ ...styles.rarityBadge, ...RARITY_BADGE[resultSticker.rarity] }}>
            {RARITY_LABEL[resultSticker.rarity]}
          </span>
          <p style={styles.resultMessage}>シール帳に追加されました！</p>
        </div>
      )}

      {/* Complete message */}
      {isComplete && !animating && (
        <div style={{ ...styles.emptyCard, borderColor: '#FFD93D', background: 'linear-gradient(145deg, #FFF9E6, #FFE0F0)' }}>
          <div style={{ fontSize: '48px', marginBottom: 8 }}>🏆</div>
          <p style={{ fontWeight: 800, color: '#FF6B9D', fontSize: '18px', margin: '0 0 4px', fontFamily: "'Fredoka', sans-serif" }}>コンプリート！</p>
          <p style={{ fontSize: '13px', color: '#B0A0B8', margin: 0 }}>全{totalStickers}種類のシールを集めたよ！</p>
        </div>
      )}

      {/* No ticket message */}
      {!canDraw && !isComplete && !animating && !showResult && (
        <div style={styles.emptyCard}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C9B1FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <p style={{ fontWeight: 700, color: '#7A6280', marginTop: 8 }}>明日また来てね！</p>
          <p style={{ fontSize: '13px', color: '#B0A0B8', marginTop: 4 }}>毎日ログインでガチャ券1枚プレゼント</p>
        </div>
      )}

      {/* Rarity guide */}
      <div style={styles.rarityGuide}>
        <p style={styles.rarityGuideTitle}>レアリティ確率</p>
        <div style={styles.rarityRow}>
          {[
            { label: 'ノーマル', pct: '70%', color: '#B0A0B8' },
            { label: 'レア', pct: '25%', color: '#42A5F5' },
            { label: 'SR', pct: '5%', color: '#FFD93D' },
          ].map(r => (
            <div key={r.label} style={styles.rarityItem}>
              <div style={{ ...styles.rarityDot, background: r.color }} />
              <span style={{ fontSize: '12px', color: '#7A6280' }}>{r.label}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: r.color }}>{r.pct}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(60px) scale(0.8); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(-60px) scale(1.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '28px 20px 24px',
    maxWidth: '480px',
    margin: '0 auto',
    minHeight: '100dvh',
    background: 'linear-gradient(180deg, #FFF0F6 0%, #F5EEFF 100%)',
    fontFamily: "'Nunito', sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '28px',
  },
  title: {
    fontSize: '28px',
    fontFamily: "'Fredoka', sans-serif",
    fontWeight: 600,
    color: '#2D1B33',
    letterSpacing: '0.5px',
  },
  ticketBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#fff',
    border: '3px solid #FFB3CB',
    borderRadius: '9999px',
    padding: '6px 16px',
    boxShadow: '3px 3px 8px rgba(255,107,157,0.15), inset -1px -1px 4px rgba(0,0,0,0.04)',
  },
  ticketCount: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#FF6B9D',
    fontFamily: "'Fredoka', sans-serif",
  },
  ticketLabel: { fontSize: '13px', color: '#B0A0B8', fontWeight: 600 },
  machineOuter: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '28px',
    padding: '16px 0',
  },
  deco: {
    position: 'absolute',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.6)',
  },
  machine: {
    width: '220px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  machineCap: {
    width: '60px',
    height: '24px',
    background: 'linear-gradient(135deg, #FF8FB1, #FF6B9D)',
    borderRadius: '12px 12px 0 0',
    border: '3px solid rgba(255,255,255,0.4)',
    borderBottom: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '3px 0 8px rgba(255,107,157,0.3)',
  },
  capKnob: {
    width: '12px',
    height: '12px',
    background: '#fff',
    borderRadius: '50%',
    opacity: 0.8,
  },
  sphereOuter: {
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FFD6E8, #C9B1FF)',
    border: '4px solid rgba(255,255,255,0.6)',
    padding: '8px',
    boxShadow: '6px 6px 16px rgba(0,0,0,0.14), inset -3px -3px 8px rgba(0,0,0,0.07)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sphere: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.92)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: 'inset -4px -4px 12px rgba(0,0,0,0.06)',
  },
  sphereShine: {
    position: 'absolute',
    top: '12px',
    left: '20px',
    width: '32px',
    height: '20px',
    background: 'rgba(255,255,255,0.8)',
    borderRadius: '50%',
    transform: 'rotate(-30deg)',
    pointerEvents: 'none',
  },
  spinGroup: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
  },
  machineBody: {
    width: '200px',
    background: 'linear-gradient(145deg, #FF8FB1, #FF6B9D)',
    borderRadius: '0 0 20px 20px',
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: 'none',
    padding: '16px 16px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '4px 6px 16px rgba(255,107,157,0.35)',
    position: 'relative',
    overflow: 'hidden',
  },
  machineStripes: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  stripe: { flex: 1 },
  gachaBtn: {
    position: 'relative',
    zIndex: 1,
    background: '#fff',
    color: '#FF6B9D',
    border: '3px solid rgba(255,255,255,0.8)',
    borderRadius: '9999px',
    padding: '12px 28px',
    fontSize: '15px',
    fontWeight: 800,
    fontFamily: "'Fredoka', sans-serif",
    letterSpacing: '0.5px',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    minHeight: '48px',
    minWidth: '140px',
  },
  gachaBtnDisabled: {
    background: 'rgba(255,255,255,0.5)',
    color: 'rgba(255,107,157,0.5)',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  machineBase: {
    width: '220px',
    height: '16px',
    background: 'linear-gradient(145deg, #E8A0B8, #CC5588)',
    borderRadius: '0 0 12px 12px',
    border: '3px solid rgba(255,255,255,0.2)',
    borderTop: 'none',
    boxShadow: '4px 4px 10px rgba(0,0,0,0.15)',
  },
  resultCard: {
    borderRadius: '24px',
    padding: '28px 24px',
    textAlign: 'center',
    marginBottom: '20px',
    boxShadow: '4px 4px 12px rgba(0,0,0,0.1), inset -2px -2px 6px rgba(0,0,0,0.05)',
  },
  resultEmoji: { fontSize: '80px', lineHeight: 1, marginBottom: '12px' },
  resultName: {
    fontSize: '24px',
    fontFamily: "'Fredoka', sans-serif",
    fontWeight: 600,
    color: '#2D1B33',
    marginBottom: '8px',
  },
  rarityBadge: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: 700,
    padding: '4px 14px',
    borderRadius: '9999px',
    marginBottom: '12px',
    letterSpacing: '0.5px',
  },
  resultMessage: { color: '#7A6280', fontSize: '14px', fontWeight: 600 },
  emptyCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '32px 24px',
    textAlign: 'center',
    border: '3px solid #EDE4F7',
    boxShadow: '4px 4px 10px rgba(0,0,0,0.06), inset -1px -1px 4px rgba(0,0,0,0.03)',
    marginBottom: '20px',
  },
  rarityGuide: {
    background: '#fff',
    borderRadius: '16px',
    padding: '16px',
    border: '3px solid rgba(201,177,255,0.3)',
    boxShadow: '3px 3px 8px rgba(0,0,0,0.06)',
  },
  rarityGuideTitle: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#B0A0B8',
    textAlign: 'center',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  rarityRow: { display: 'flex', justifyContent: 'space-around' },
  rarityItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  rarityDot: { width: '10px', height: '10px', borderRadius: '50%' },
};
