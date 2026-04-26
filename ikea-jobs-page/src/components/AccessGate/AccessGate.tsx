import { useState, useRef, useEffect, useCallback } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const IDLE_MS    = 5 * 60 * 1000;
const SERVER_URL = process.env.REACT_APP_JOBS_SERVER_URL || 'http://localhost:3001';
const SITE_KEY   = process.env.REACT_APP_RECAPTCHA_SITE_KEY || '';

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'] as const;

/* ── styles ── */
const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 9999,
  background: 'rgba(0,0,0,0.75)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const box: React.CSSProperties = {
  background: '#fff', borderRadius: 8, padding: '40px 48px',
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  gap: 20, minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
};
const titleStyle:    React.CSSProperties = { fontSize: 22, fontWeight: 700, color: '#111', textAlign: 'center', fontFamily: 'Arial, sans-serif' };
const subtitleStyle: React.CSSProperties = { fontSize: 14, color: '#555', textAlign: 'center', fontFamily: 'Arial, sans-serif' };
const inputStyle:    React.CSSProperties = { width: '100%', padding: '10px 14px', fontSize: 16, border: '1.5px solid #ccc', borderRadius: 6, outline: 'none', boxSizing: 'border-box', letterSpacing: 4, textAlign: 'center' };
const buttonStyle:   React.CSSProperties = { width: '100%', padding: '11px 0', fontSize: 16, fontWeight: 700, background: '#0058a3', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' };
const errorStyle:    React.CSSProperties = { color: '#c62828', fontSize: 13, fontFamily: 'Arial, sans-serif' };
const idleStyle:     React.CSSProperties = { color: '#e65100', fontSize: 13, fontFamily: 'Arial, sans-serif' };

export const AccessGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // granted starts false on every page load / reload — no sessionStorage
  const [granted,  setGranted]  = useState(false);
  const [idleOut,  setIdleOut]  = useState(false);
  const [token,    setToken]    = useState('');
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── idle timer ── */
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setGranted(false);
      setIdleOut(true);
      setToken('');
    }, IDLE_MS);
  }, []);

  useEffect(() => {
    if (!granted) return;
    ACTIVITY_EVENTS.forEach(ev => window.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      ACTIVITY_EVENTS.forEach(ev => window.removeEventListener(ev, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [granted, resetTimer]);

  if (granted) return <>{children}</>;

  /* ── submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (SITE_KEY && !recaptchaRef.current?.getValue()) {
      setError('יש לאשר שאינך רובוט');
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch(`${SERVER_URL}/api/verify-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, recaptchaToken: recaptchaRef.current?.getValue() || '' }),
      });
      const data = await res.json();
      if (data.success) {
        setIdleOut(false);
        setGranted(true);
      } else {
        setError('טוקן שגוי — נסה שנית');
        setToken('');
        recaptchaRef.current?.reset();
      }
    } catch {
      setError('שגיאת רשת — נסה שנית');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={overlay}>
        <form style={box} onSubmit={handleSubmit}>
          <div style={titleStyle}>קובי שלזינגר תוכנה</div>
          <div style={subtitleStyle}>יש להזין טוקן גישה להמשך</div>
          {idleOut && (
            <div style={idleStyle}>פג תוקף הגישה עקב חוסר פעילות</div>
          )}
          <input
            style={inputStyle}
            type="password"
            placeholder="טוקן"
            value={token}
            autoFocus
            onChange={e => { setToken(e.target.value); setError(null); }}
            dir="ltr"
          />
          {SITE_KEY && (
            <ReCAPTCHA ref={recaptchaRef} sitekey={SITE_KEY} />
          )}
          {error && <div style={errorStyle}>{error}</div>}
          <button style={buttonStyle} type="submit" disabled={loading}>
            {loading ? '...' : 'כניסה'}
          </button>
        </form>
      </div>
      {children}
    </>
  );
};
