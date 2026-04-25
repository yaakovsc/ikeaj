import { useState } from 'react';

const CORRECT_TOKEN = 'jumpstartxx2!';
const SESSION_KEY = 'ikea_access_granted';

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

const title: React.CSSProperties = {
  fontSize: 22, fontWeight: 700, color: '#111', textAlign: 'center',
  fontFamily: 'Arial, sans-serif',
};

const subtitle: React.CSSProperties = {
  fontSize: 14, color: '#555', textAlign: 'center', fontFamily: 'Arial, sans-serif',
};

const input: React.CSSProperties = {
  width: '100%', padding: '10px 14px', fontSize: 16,
  border: '1.5px solid #ccc', borderRadius: 6, outline: 'none',
  boxSizing: 'border-box', letterSpacing: 4, textAlign: 'center',
};

const button: React.CSSProperties = {
  width: '100%', padding: '11px 0', fontSize: 16, fontWeight: 700,
  background: '#0058a3', color: '#fff', border: 'none',
  borderRadius: 6, cursor: 'pointer',
};

const errorStyle: React.CSSProperties = {
  color: '#c62828', fontSize: 13, fontFamily: 'Arial, sans-serif',
};

export const AccessGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [granted, setGranted] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === '1'
  );
  const [token, setToken] = useState('');
  const [error, setError] = useState(false);

  if (granted) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token === CORRECT_TOKEN) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setGranted(true);
    } else {
      setError(true);
      setToken('');
    }
  };

  return (
    <>
      <div style={overlay}>
        <form style={box} onSubmit={handleSubmit}>
          <div style={title}>קובי שלזינגר תוכנה</div>
          <div style={subtitle}>יש להזין טוקן גישה להמשך</div>
          <input
            style={input}
            type="password"
            placeholder="טוקן"
            value={token}
            autoFocus
            onChange={e => { setToken(e.target.value); setError(false); }}
            dir="ltr"
          />
          {error && <div style={errorStyle}>טוקן שגוי — נסה שנית</div>}
          <button style={button} type="submit">כניסה</button>
        </form>
      </div>
      {children}
    </>
  );
};
