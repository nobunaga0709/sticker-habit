import { useState, useEffect } from 'react';
import GachaScreen from './components/GachaScreen';
import StickerBookScreen from './components/StickerBookScreen';
import HabitScreen from './components/HabitScreen';
import CalendarScreen from './components/CalendarScreen';
import { useAppStore } from './store/useAppStore';

type Tab = 'gacha' | 'stickers' | 'habits' | 'calendar';

// SVG icons (Lucide-style, 24x24 viewBox)
const GachaIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#FF6B9D' : '#B0A0B8'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const StickerIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#FF6B9D' : '#B0A0B8'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    <line x1="8" y1="7" x2="16" y2="7"/>
    <line x1="8" y1="11" x2="13" y2="11"/>
  </svg>
);

const HabitIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#FF6B9D' : '#B0A0B8'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const CalendarIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#FF6B9D' : '#B0A0B8'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const TABS: { id: Tab; label: string }[] = [
  { id: 'gacha', label: 'ガチャ' },
  { id: 'stickers', label: 'シール帳' },
  { id: 'habits', label: '習慣' },
  { id: 'calendar', label: 'カレンダー' },
];

function DailyTicketManager() {
  useEffect(() => {
    const checkAndGrantTicket = () => {
      const store = useAppStore.getState();
      const { gachaTicket } = store;
      const today = new Date().toDateString();

      if (!gachaTicket.lastReceivedAt) return;

      const lastDate = new Date(gachaTicket.lastReceivedAt).toDateString();
      if (lastDate !== today && gachaTicket.count === 0) {
        useAppStore.setState({
          gachaTicket: { count: 1, lastReceivedAt: gachaTicket.lastReceivedAt },
        });
      }
    };

    checkAndGrantTicket();
    const interval = setInterval(checkAndGrantTicket, 60000);
    return () => clearInterval(interval);
  }, []);

  return null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('habits');

  return (
    <div style={styles.app}>
      <DailyTicketManager />
      <div style={styles.content}>
        {activeTab === 'gacha' && <GachaScreen />}
        {activeTab === 'stickers' && <StickerBookScreen />}
        {activeTab === 'habits' && <HabitScreen />}
        {activeTab === 'calendar' && <CalendarScreen />}
      </div>

      <nav style={styles.nav} role="navigation" aria-label="メインナビゲーション">
        {TABS.map((tab, i) => {
          const active = activeTab === tab.id;
          const icons = [GachaIcon, StickerIcon, HabitIcon, CalendarIcon];
          const Icon = icons[i];
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.navItem,
                background: active ? 'rgba(255,107,157,0.12)' : 'transparent',
              }}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              <span style={{
                ...styles.navIconWrap,
                transform: active ? 'translateY(-1px) scale(1.1)' : 'scale(1)',
              }}>
                <Icon active={active} />
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: active ? 700 : 500,
                color: active ? '#FF6B9D' : '#B0A0B8',
                letterSpacing: '0.2px',
                fontFamily: "'Nunito', sans-serif",
              }}>
                {tab.label}
              </span>
              {active && <div style={styles.navDot} />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    maxWidth: '480px',
    margin: '0 auto',
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-bg)',
    boxShadow: '0 0 60px rgba(0,0,0,0.15)',
    position: 'relative',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingBottom: '80px',
  },
  nav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '480px',
    display: 'flex',
    background: 'rgba(255,255,255,0.96)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderTop: '3px solid rgba(255,107,157,0.15)',
    padding: '8px 0 env(safe-area-inset-bottom, 8px)',
    zIndex: 100,
    boxShadow: '0 -4px 24px rgba(255,107,157,0.12)',
  },
  navItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    padding: '6px 4px',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    borderRadius: '12px',
    margin: '0 4px',
    minHeight: '56px',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  navIconWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  navDot: {
    position: 'absolute',
    bottom: '3px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: '#FF6B9D',
  },
};
