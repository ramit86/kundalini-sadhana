import { useState } from 'react';
import { useAuth } from '../lib/authContext';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) { setError('Please fill all fields.'); return; }
    if (mode === 'register' && !displayName) { setError('Enter your name.'); return; }
    setLoading(true);
    const err = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password, displayName);
    setLoading(false);
    if (err) setError(err);
  };

  const gold = '#C8A96E';

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #0A0806 0%, #100D09 60%, #0D0A07 100%)',
      padding: '2rem',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: `radial-gradient(ellipse, ${gold}09 0%, transparent 65%)`,
        top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
        filter: 'blur(50px)', pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 380, animation: 'fadeUp 0.6s ease both' }}>
        {/* Logo mark */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', margin: '0 auto 1rem',
            border: `1px solid ${gold}33`,
            background: `radial-gradient(ellipse, ${gold}18 0%, transparent 70%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2 L12 22 M2 12 L22 12" stroke={gold} strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
              <circle cx="12" cy="12" r="4" stroke={gold} strokeWidth="1" fill="none" opacity="0.8"/>
              <circle cx="12" cy="12" r="8" stroke={gold} strokeWidth="0.5" fill="none" opacity="0.3"/>
            </svg>
          </div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.6rem', fontWeight: 300, color: '#EDE5DA',
            letterSpacing: '0.05em', marginBottom: 4,
          }}>
            Kundalini Sadhana
          </div>
          <div style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: '9px', letterSpacing: '0.35em',
            textTransform: 'uppercase', color: '#4A4038',
          }}>
            {mode === 'login' ? 'Sign in to continue' : 'Begin your journey'}
          </div>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              style={inputStyle}
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={inputStyle}
          />

          {error && (
            <div style={{
              fontFamily: "'Raleway', sans-serif",
              fontSize: '11px', color: '#E07070', letterSpacing: '0.03em',
              padding: '8px 12px', background: 'rgba(224,112,112,0.08)',
              borderRadius: 8, border: '1px solid rgba(224,112,112,0.2)',
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '13px 20px',
              background: loading ? `${gold}22` : `linear-gradient(135deg, ${gold}28, ${gold}14)`,
              border: `1px solid ${gold}55`,
              borderRadius: 24, cursor: loading ? 'default' : 'pointer',
              fontFamily: "'Raleway', sans-serif",
              fontSize: '10px', fontWeight: 500, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: loading ? '#5A5040' : '#EDE5DA',
              transition: 'all 0.25s ease', marginTop: 4,
            }}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 6 }}>
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'Raleway', sans-serif", fontSize: '10px',
                color: '#5A5040', letterSpacing: '0.06em',
                textDecoration: 'underline', textUnderlineOffset: 3,
              }}
            >
              {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(200,169,110,0.14)',
  borderRadius: 12,
  color: '#C8B89A',
  fontFamily: "'Raleway', sans-serif",
  fontSize: '12px', fontWeight: 300,
  outline: 'none',
  transition: 'border-color 0.2s',
};
