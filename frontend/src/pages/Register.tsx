import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(name, email, password);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.brand}>
          <MessageSquare size={28} color="#25d366" />
          <span style={s.brandName}>ChatApp</span>
        </div>
        <h2 style={s.title}>Create account</h2>
        <p style={s.sub}>Join ChatApp and start messaging instantly.</p>

        {error && (
          <div style={s.error}>
            <AlertCircle size={15} color="#f15c6d" />
            <span>{error}</span>
          </div>
        )}

        <div style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Your name</label>
            <input style={s.input} type="text" placeholder="John Doe"
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <div style={s.pwWrap}>
              <input style={s.pwInput} type={show ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" style={s.eye} onClick={() => setShow(!show)}>
                {show ? <EyeOff size={17} color="#8696a0" /> : <Eye size={17} color="#8696a0" />}
              </button>
            </div>
          </div>
          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
            onClick={handle} disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
          <p style={s.switch}>
            Already have an account? <Link to="/login" style={s.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#0b141a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: "'Inter','Segoe UI',sans-serif" },
  card: { backgroundColor: '#111b21', border: '1px solid #2a3942', borderRadius: 16, padding: '2.5rem 2rem', width: '100%', maxWidth: 400 },
  brand: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem', justifyContent: 'center' },
  brandName: { fontWeight: 800, fontSize: '1.2rem', color: '#e9edef', letterSpacing: '-0.02em' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#e9edef', margin: '0 0 0.3rem 0', textAlign: 'center' },
  sub: { color: '#8696a0', fontSize: '0.875rem', textAlign: 'center', margin: '0 0 1.75rem 0' },
  error: { display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#2d1b1e', border: '1px solid #5c2830', borderRadius: 8, padding: '0.7rem 0.9rem', color: '#f15c6d', fontSize: '0.85rem', marginBottom: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  label: { fontSize: '0.82rem', fontWeight: 600, color: '#8696a0' },
  input: { padding: '0.75rem 0.9rem', borderRadius: 8, border: '1px solid #2a3942', backgroundColor: '#202c33', color: '#e9edef', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  pwWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  pwInput: { width: '100%', padding: '0.75rem 2.8rem 0.75rem 0.9rem', borderRadius: 8, border: '1px solid #2a3942', backgroundColor: '#202c33', color: '#e9edef', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' },
  eye: { position: 'absolute', right: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 },
  btn: { padding: '0.8rem', backgroundColor: '#25d366', color: '#0a0a0a', border: 'none', borderRadius: 8, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.25rem' },
  switch: { textAlign: 'center', fontSize: '0.875rem', color: '#8696a0', margin: 0 },
  link: { color: '#25d366', fontWeight: 600, textDecoration: 'none' },
};

export default Register;