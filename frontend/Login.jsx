import React, { useState } from 'react';

export default function Login({ onLogin }){
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async ()=>{
    if(!username.trim()) return;
    setLoading(true);
    try{
      await onLogin(username.trim());
    }catch(e){
      alert('Login failed');
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2 style={{marginTop:0}}>Welcome to ChatApp</h2>
      <p className="small">Enter a username to continue</p>
      <div style={{marginTop:12}}>
        <input className="input" placeholder="e.g. alice" value={username} onChange={e=>setUsername(e.target.value)} />
      </div>
      <div style={{marginTop:12,display:'flex',gap:8,justifyContent:'flex-end'}}>
        <button className="button" onClick={submit} disabled={loading}>{loading ? 'Joining...' : 'Join'}</button>
      </div>
    </div>
  )
}