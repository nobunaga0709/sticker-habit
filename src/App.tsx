import { useState, useEffect } from 'react';
import GachaScreen from './components/GachaScreen';
import StickerBookScreen from './components/StickerBookScreen';
import HabitScreen from './components/HabitScreen';
import CalendarScreen from './components/CalendarScreen';
import { useAppStore } from './store/useAppStore';

type Tab = 'gacha' | 'stickers' | 'habits' | 'calendar';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'gacha', label: 'ガチャ', icon: '🎰' },
  { id: 'stickers', label: 'シール帳', icon: '📚' },
  { id: 'habits', label: '習慣', icon: '✅' },
  { id: 'calendar', label: 'カレンダー', icon: '📅' },
];

function DailyTicketManager() {

  useEffect(() => {
    const checkAndGrantTicket = () => {
      const store = useAppStore.getState();
      const { gachaTicket } = store;
      const now = new Date();
      const today = now.toDateString();

      if (!gachaTicket.lastReceivedAt) {
        // First time — already has 1 ticket from initial state
        return;
      }

      const lastDate = new Date(gachaTicket.lastReceivedAt).toDateString();
      if (lastDate !== today && gachaTicket.count === 0) {
        useAppStore.setState({
          gachaTicket: {
            count: 1,
            lastReceivedAt: gachaTicket.lastReceivedAt,
          },
        });
      }
    };

    checkAndGrantTicket();
    const interval = setInterval(checkAndGrantTicket, 60000); // check every minute
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

      {/* Bottom Navigation */}
      <nav style={styles.nav}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.navItem,
              color: activeTab === tab.id ? '#ff6ec4' : '#aaa',
            }}
          >
            <span style={{
              ...styles.navIcon,
              fontSize: activeTab === tab.id ? '26px' : '22px',
              transform: activeTab === tab.id ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all 0.2s ease',
            }}>
              {tab.icon}
            </span>
            <span style={{
              ...styles.navLabel,
              fontWeight: activeTab === tab.id ? 700 : 400,
              color: activeTab === tab.id ? '#ff6ec4' : '#aaa',
            }}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <div style={styles.navIndicator} />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    maxWidth: '480px',
    margin: '0 auto',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    background: '#fafafa',
    boxShadow: '0 0 40px rgba(0,0,0,0.1)',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
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
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(12px)',
    borderTop: '1px solid rgba(0,0,0,0.08)',
    padding: '8px 0 env(safe-area-inset-bottom, 8px)',
    zIndex: 100,
    boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
  },
  navItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '4px 0',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
  },
  navIcon: {
    display: 'block',
    lineHeight: 1,
  },
  navLabel: {
    fontSize: '10px',
    letterSpacing: '0.3px',
  },
  navIndicator: {
    position: 'absolute',
    top: '2px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: '#ff6ec4',
  },
};
