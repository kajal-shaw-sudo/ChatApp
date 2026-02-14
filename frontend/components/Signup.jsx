import React, { useState } from 'react';

export default function Signup({ onSignup, onSwitch }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!username || !email || !password) return setError('All fields required');
    setLoading(true);
    try { await onSignup({ username, email, password }); }
    catch (e) { setError(e.response?.data?.error || 'Signup failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Create Account</h2>
      {error && <div style={{ background: '#fee', color: '#c33', padding: 8, borderRadius: 6, marginBottom: 12 }}>{error}</div>}
      <button onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'} style={{ width: '100%', padding: 14, background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <svg width="20" height="20"><path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" /><path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z" /><path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z" /><path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z" /></svg>
        Continue with Google
      </button>
      <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: 12 }}><div style={{ flex: 1, height: 1, background: '#e5e7eb' }} /><span style={{ color: '#9ca3af', fontSize: 14 }}>OR</span><div style={{ flex: 1, height: 1, background: '#e5e7eb' }} /></div>
      <input className="input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ marginTop: 12 }} />
      <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ marginTop: 12 }} />
      <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ marginTop: 12 }} />
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onSwitch} style={{ background: 'transparent', border: 'none', color: '#667eea', cursor: 'pointer' }}>Login</button>
        <button className="button" onClick={submit} disabled={loading}>{loading ? 'Creating...' : 'Sign Up'}</button>
      </div>
    </div>
  );
}