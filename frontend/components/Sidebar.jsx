import React from 'react';

export default function Sidebar({ users, onSelectUser, selectedUser, currentUser, getUnreadCount }) {
  return (
    <>
      {users.map(u => (
        <div
          key={u._id}
          className={'user-item ' + (selectedUser?._id === u._id ? 'selected' : '')}
          onClick={() => onSelectUser(u)}
        >
          <div className="avatar" style={{ backgroundImage: u.profilePicture ? `url(${u.profilePicture})` : 'none', backgroundSize: 'cover' }}>
            {!u.profilePicture && u.username[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{u.username}{u._id === currentUser._id && ' (You)'}</div>
            <div className="small">{u.isOnline ? 'Online' : 'Offline'}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {getUnreadCount(u._id) > 0 && (
              <div style={{ background: '#667eea', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                {getUnreadCount(u._id)}
              </div>
            )}
            <div className="dot" style={{ background: u.isOnline ? '#22c55e' : '#94a3b8' }}></div>
          </div>
        </div>
      ))}
    </>
  );
}