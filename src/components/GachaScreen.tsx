import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { STICKER_MAP } from '../data/presetStickers';
import type { UserSticker } from '../types';

const RARITY_LABEL: Record<string, string> = {
  normal: 'ノーマル',
  rare: 'レア',
  superRare: 'スーパーレア',
};

const RARITY_STYLE: Record<string, React.CSSProperties> = {
  normal: { background: 'linear-gradient(135deg, #f5f5f5, #e0e0e0)', border: '2px solid #bdbdbd' },
  rare: { background: 'linear-gradient(135deg, #e3f2fd, #90caf9)', border: '2px solid #42a5f5' },
  superRare: { background: 'linear-gradient(135deg, #fff9c4, #ffe082)', border: '3px solid #ffd600' },
};

export default function GachaScreen() {
  const { gachaTicket, drawGachaTicket, canDrawGacha } = useAppStore();
  const [result, setResult] = useState<UserSticker | null>(null);
  const [animating, setAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleGacha = () => {
    if (!canDrawGacha() || animating) return;
    setShowResult(false);
    setAnimating(true);
    
    setTimeout(() => {
      const newSticker = drawGachaTicket();
      setResult(newSticker);
      setAnimating(false);
      setShowResult(true);
    }, 1200);
  };

  const resultSticker = result ? STICKER_MAP[result.stickerId] : null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🎰 ガチャ</h1>
        <div style={styles.ticketBadge}>
          <span style={styles.ticketIcon}>🎟️</span>
          <span style={styles.ticketCount}>{gachaTicket.count}</span>
          <span style={styles.ticketLabel}>枚</span>
        </div>
      </div>

      <div style={styles.machineContainer}>
        <div style={{
          ...styles.gachaMachine,
          transform: animating ? 'scale(0.95)' : 'scale(1)',
          transition: 'transform 0.3s ease',
        }}>
          <div style={styles.machineTop}>
            <div style={{
              ...styles.machineWindow,
              animation: animating ? 'spin 0.3s linear infinite' : 'none',
            }}>
              {animating ? (
                <div style={styles.spinningEmojis}>
                  {['⭐', '❤️', '🌸', '✨', '🦄'].map((e, i) => (
                    <div key={i} style={{
                      position: 'absolute',
                      fontSize: '32px',
                      animation: `floatUp ${0.4 + i * 0.1}s ease-out infinite`,
                      left: `${20 + i * 15}%`,
                    }}>{e}</div>
                  ))}
                </div>
              ) : showResult && resultSticker ? (
                <div style={{ fontSize: '80px', animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                  {resultSticker.emoji}
                </div>
              ) : (
                <div style={{ fontSize: '60px', opacity: 0.3 }}>🎁</div>
              )}
            </div>
          </div>
          <div style={styles.machineBody}>
            <button
              onClick={handleGacha}
              disabled={!canDrawGacha() || animating}
              style={{
                ...styles.gachaButton,
                opacity: (!canDrawGacha() || animating) ? 0.5 : 1,
                cursor: (!canDrawGacha() || animating) ? 'not-allowed' : 'pointer',
                transform: animating ? 'translateY(2px)' : 'translateY(0)',
              }}
            >
              {animating ? '回転中...' : canDrawGacha() ? 'ガチャを回す！' : 'チケットなし'}
            </button>
          </div>
        </div>
      </div>

      {showResult && resultSticker && (
        <div style={{
          ...styles.resultCard,
          ...RARITY_STYLE[resultSticker.rarity],
          animation: 'slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}>
          <div style={styles.resultEmoji}>{resultSticker.emoji}</div>
          <div style={styles.resultName}>{resultSticker.name}</div>
          <div style={{
            ...styles.rarityBadge,
            background: resultSticker.rarity === 'superRare' ? '#ffd600' :
                        resultSticker.rarity === 'rare' ? '#42a5f5' : '#9e9e9e',
          }}>
            {RARITY_LABEL[resultSticker.rarity]}
          </div>
          <p style={styles.resultMessage}>シール帳に追加されました！✨</p>
        </div>
      )}

      {!canDrawGacha() && !animating && (
        <div style={styles.emptyMessage}>
          <p>🌙 明日またガチャ券がもらえるよ！</p>
          <p style={{ fontSize: '13px', color: '#9e9e9e' }}>毎日ログインでガチャ券1枚プレゼント</p>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          0% { transform: translateY(40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes floatUp {
          0% { transform: translateY(100px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-100px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px 20px',
    maxWidth: '480px',
    margin: '0 auto',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #fff0f6 0%, #fef6ff 100%)',
    fontFamily: '"Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    margin: 0,
    color: '#333',
  },
  ticketBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: '#fff',
    border: '2px solid #ffb3c6',
    borderRadius: '20px',
    padding: '6px 14px',
    boxShadow: '0 2px 8px rgba(255,100,150,0.15)',
  },
  ticketIcon: { fontSize: '18px' },
  ticketCount: { fontSize: '22px', fontWeight: 700, color: '#e91e8c' },
  ticketLabel: { fontSize: '13px', color: '#888' },
  machineContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '32px',
  },
  gachaMachine: {
    width: '260px',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 12px 40px rgba(233,30,140,0.2)',
  },
  machineTop: {
    background: 'linear-gradient(135deg, #ff6ec4, #ff9a9e)',
    padding: '24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  machineWindow: {
    width: '160px',
    height: '160px',
    background: 'rgba(255,255,255,0.9)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.1)',
  },
  spinningEmojis: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  machineBody: {
    background: 'linear-gradient(135deg, #ff9a9e, #fad0c4)',
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
  },
  gachaButton: {
    background: 'linear-gradient(135deg, #ff6ec4, #c850c0)',
    color: '#fff',
    border: 'none',
    borderRadius: '28px',
    padding: '14px 40px',
    fontSize: '16px',
    fontWeight: 700,
    letterSpacing: '0.5px',
    boxShadow: '0 4px 16px rgba(200,80,192,0.4)',
    transition: 'all 0.2s ease',
  },
  resultCard: {
    borderRadius: '20px',
    padding: '24px',
    textAlign: 'center',
    margin: '0 4px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  },
  resultEmoji: { fontSize: '72px', marginBottom: '8px', lineHeight: 1 },
  resultName: { fontSize: '20px', fontWeight: 700, color: '#333', marginBottom: '8px' },
  rarityBadge: {
    display: 'inline-block',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 700,
    padding: '4px 12px',
    borderRadius: '12px',
    marginBottom: '8px',
  },
  resultMessage: { color: '#666', fontSize: '14px', margin: '8px 0 0' },
  emptyMessage: {
    textAlign: 'center',
    color: '#888',
    fontSize: '15px',
    padding: '24px',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
};
