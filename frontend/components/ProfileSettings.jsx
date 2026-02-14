import React, { useState } from 'react';
import { FiX, FiCamera, FiUser, FiLock, FiChevronDown, FiChevronUp, FiLogOut } from 'react-icons/fi';
import api from '../services/api';

export default function ProfileSettings({ user, onClose, onUpdate, onLogout }) {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('profilePicture', file);
    try {
      const res = await api.uploadProfilePicture(formData);
      onUpdate(res.data.user);
      setMessage('Picture updated!');
      setTimeout(() => setMessage(''), 3000);
    } catch { setError('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const res = await api.updateProfile({ username, email });
      onUpdate(res.data.user);
      if (res.data.token) localStorage.setItem('token', res.data.token);
      setMessage('Profile updated!');
      setShowProfileEdit(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (e) { setError(e.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setMessage('Password changed!');
      setShowPasswordChange(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (e) { setError(e.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 16, width: '90%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ padding: 24, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <h2 style={{ margin: 0 }}>Profile Settings</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 8, borderRadius: '50%' }}><FiX size={24} /></button>
        </div>
        <div style={{ padding: 24 }}>
          {message && <div style={{ background: '#d1fae5', color: '#065f46', padding: 12, borderRadius: 8, marginBottom: 16 }}>{message}</div>}
          {error && <div style={{ background: '#fee', color: '#c33', padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div className="avatar" style={{ width: 120, height: 120, fontSize: 48, backgroundImage: user.profilePicture ? `url(${user.profilePicture})` : 'none', backgroundSize: 'cover' }}>{!user.profilePicture && user.username[0]}</div>
              <label style={{ position: 'absolute', bottom: 0, right: 0, background: '#667eea', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '3px solid white' }}><FiCamera color="white" size={20} /><input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} /></label>
            </div>
            <div style={{ marginTop: 12 }}><div style={{ fontWeight: 700, fontSize: 20 }}>{user.username}</div><div className="small" style={{ color: '#6b7280' }}>{user.email}</div></div>
            {uploading && <p className="small" style={{ marginTop: 8, color: '#667eea' }}>Uploading...</p>}
          </div>
          <button onClick={() => { setShowProfileEdit(!showProfileEdit); setShowPasswordChange(false); }} style={{ width: '100%', padding: 14, background: showProfileEdit ? '#667eea' : 'white', color: showProfileEdit ? 'white' : '#667eea', border: '2px solid #667eea', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}><FiUser size={18} />Edit Profile{showProfileEdit ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}</button>
          {showProfileEdit && <div style={{ marginBottom: 16, padding: 16, background: '#f9fafb', borderRadius: 12 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Username</label>
            <input className="input" value={username} onChange={e => setUsername(e.target.value)} style={{ marginBottom: 16 }} />
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Email</label>
            <input className="input" value={email} onChange={e => setEmail(e.target.value)} style={{ marginBottom: 16 }} />
            <button className="button" onClick={handleUpdateProfile} disabled={loading} style={{ width: '100%' }}>{loading ? 'Updating...' : 'Save Changes'}</button>
          </div>}
          <button onClick={() => { setShowPasswordChange(!showPasswordChange); setShowProfileEdit(false); }} style={{ width: '100%', padding: 14, background: showPasswordChange ? '#667eea' : 'white', color: showPasswordChange ? 'white' : '#667eea', border: '2px solid #667eea', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}><FiLock size={18} />Change Password{showPasswordChange ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}</button>
          {showPasswordChange && <div style={{ marginBottom: 16, padding: 16, background: '#f9fafb', borderRadius: 12 }}>
            <input className="input" type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={{ marginBottom: 16 }} />
            <input className="input" type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ marginBottom: 16 }} />
            <button className="button" onClick={handleChangePassword} disabled={loading} style={{ width: '100%' }}>{loading ? 'Changing...' : 'Update Password'}</button>
          </div>}
          <button onClick={onLogout} style={{ width: '100%', padding: 14, background: 'white', color: '#ef4444', border: '2px solid #ef4444', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><FiLogOut size={18} />Logout</button>
        </div>
      </div>
    </div>
  );
}