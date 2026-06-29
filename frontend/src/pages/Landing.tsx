import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Shield, Zap, Users } from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/chat');
  }, [user]);

  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.navBrand}>
          <MessageSquare size={22} color="#25d366" />
          <span style={s.brandName}>ChatApp</span>
        </div>
        <div style={s.navActions}>
          <button style={s.navOutline} onClick={() => navigate('/login')}>
            Sign in
          </button>
          <button style={s.navFilled} onClick={() => navigate('/register')}>
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.badge}>Real-time messaging</div>
          <h1 style={s.heroTitle}>
            Simple. Secure.<br />Real-time chat.
          </h1>
          <p style={s.heroSub}>
            Connect with anyone instantly. Create rooms, send direct messages,
            and stay in sync — all in real time.
          </p>
          <div style={s.heroBtns}>
            <button style={s.primaryBtn} onClick={() => navigate('/register')}>
              Start messaging
            </button>
            <button style={s.secondaryBtn} onClick={() => navigate('/login')}>
              Sign in
            </button>
          </div>
        </div>

        {/* Mock chat preview */}
        <div style={s.mockup}>
          <div style={s.mockupHeader}>
            <div style={s.mockupAvatar} />
            <div>
              <div style={s.mockupName}>General</div>
              <div style={s.mockupSub}>3 members online</div>
            </div>
          </div>
          <div style={s.mockupBody}>
            {[
              { text: 'Hey everyone!', sent: false, name: 'Alex' },
              { text: 'Welcome to ChatApp', sent: true, name: 'You' },
              { text: 'This is real-time', sent: false, name: 'Sam' },
              { text: 'Pretty fast right?', sent: true, name: 'You' },
            ].map((msg, i) => (
              <div key={i} style={{ ...s.mockMsg, justifyContent: msg.sent ? 'flex-end' : 'flex-start' }}>
                <div style={{ ...s.mockBubble, backgroundColor: msg.sent ? '#005c4b' : '#1f2c34' }}>
                  {!msg.sent && <div style={s.mockSender}>{msg.name}</div>}
                  <div style={s.mockText}>{msg.text}</div>
                  <div style={s.mockTime}>12:0{i} PM</div>
                </div>
              </div>
            ))}
            <div style={s.typingRow}>
              <div style={s.typingBubble}>
                <span style={s.dot} /><span style={s.dot} /><span style={s.dot} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={s.features}>
        {[
          { icon: <Zap size={20} color="#25d366" />, title: 'Real-time', desc: 'Messages delivered instantly via WebSocket technology' },
          { icon: <Shield size={20} color="#25d366" />, title: 'Secure', desc: 'JWT authentication and row-level security on every request' },
          { icon: <Users size={20} color="#25d366" />, title: 'Group rooms', desc: 'Create and join public rooms or start private conversations' },
          { icon: <MessageSquare size={20} color="#25d366" />, title: 'Chat history', desc: 'Messages are persisted so you never miss a conversation' },
        ].map((f, i) => (
          <div key={i} style={s.featureCard}>
            <div style={s.featureIcon}>{f.icon}</div>
            <h3 style={s.featureTitle}>{f.title}</h3>
            <p style={s.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <span style={{ color: '#8696a0', fontSize: '0.85rem' }}>
          Built with React, Node.js, Socket.io and Supabase
        </span>
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#e9edef', fontFamily: "'Inter','Segoe UI',sans-serif", display: 'flex', flexDirection: 'column' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid #2a3942', position: 'sticky', top: 0, backgroundColor: '#0a0a0a', zIndex: 10 },
  navBrand: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  brandName: { fontWeight: 700, fontSize: '1.1rem', color: '#e9edef', letterSpacing: '-0.02em' },
  navActions: { display: 'flex', gap: '0.75rem' },
  navOutline: { padding: '0.5rem 1.1rem', borderRadius: 8, border: '1px solid #2a3942', background: 'none', color: '#e9edef', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' },
  navFilled: { padding: '0.5rem 1.1rem', borderRadius: 8, border: 'none', background: '#25d366', color: '#0a0a0a', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' },
  hero: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3rem', padding: '5rem 2rem', maxWidth: 1100, margin: '0 auto', width: '100%', flexWrap: 'wrap' },
  heroInner: { flex: 1, minWidth: 280 },
  badge: { display: 'inline-block', padding: '0.3rem 0.85rem', borderRadius: 999, border: '1px solid #25d366', color: '#25d366', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.25rem' },
  heroTitle: { fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 1rem 0', color: '#e9edef' },
  heroSub: { fontSize: '1rem', color: '#8696a0', lineHeight: 1.65, margin: '0 0 2rem 0', maxWidth: 420 },
  heroBtns: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  primaryBtn: { padding: '0.8rem 1.75rem', borderRadius: 10, border: 'none', background: '#25d366', color: '#0a0a0a', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' },
  secondaryBtn: { padding: '0.8rem 1.75rem', borderRadius: 10, border: '1px solid #2a3942', background: 'none', color: '#e9edef', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' },
  mockup: { flex: 1, minWidth: 280, maxWidth: 360, backgroundColor: '#111b21', borderRadius: 16, overflow: 'hidden', border: '1px solid #2a3942', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' },
  mockupHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', backgroundColor: '#202c33', borderBottom: '1px solid #2a3942' },
  mockupAvatar: { width: 36, height: 36, borderRadius: '50%', backgroundColor: '#25d366' },
  mockupName: { fontSize: '0.9rem', fontWeight: 600, color: '#e9edef' },
  mockupSub: { fontSize: '0.75rem', color: '#25d366' },
  mockupBody: { padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: 260, backgroundColor: '#0b141a' },
  mockMsg: { display: 'flex' },
  mockBubble: { padding: '0.5rem 0.75rem', borderRadius: 10, maxWidth: '75%' },
  mockSender: { fontSize: '0.72rem', color: '#25d366', fontWeight: 600, marginBottom: '0.2rem' },
  mockText: { fontSize: '0.875rem', color: '#e9edef' },
  mockTime: { fontSize: '0.65rem', color: '#8696a0', textAlign: 'right', marginTop: '0.2rem' },
  typingRow: { display: 'flex', justifyContent: 'flex-start' },
  typingBubble: { backgroundColor: '#1f2c34', borderRadius: 10, padding: '0.6rem 0.85rem', display: 'flex', gap: 4, alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: '50%', backgroundColor: '#8696a0', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out' },
  features: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', padding: '3rem 2rem', maxWidth: 1100, margin: '0 auto', width: '100%' },
  featureCard: { backgroundColor: '#111b21', border: '1px solid #2a3942', borderRadius: 14, padding: '1.5rem' },
  featureIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#0d2e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' },
  featureTitle: { fontSize: '1rem', fontWeight: 700, color: '#e9edef', margin: '0 0 0.4rem 0' },
  featureDesc: { fontSize: '0.875rem', color: '#8696a0', lineHeight: 1.55, margin: 0 },
  footer: { borderTop: '1px solid #2a3942', padding: '1.5rem 2rem', textAlign: 'center', marginTop: 'auto' },
};

export default Landing;