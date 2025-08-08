import React from 'react';

export default function Sidebar({ users, onSelectUser, selectedUser }){
  return (
    <>
      {users.map(u=>(
        <div key={u._id} className={'user-item ' + (selectedUser && selectedUser._id===u._id ? 'selected':'')}
             onClick={()=>onSelectUser(u)}>
          <div className="avatar">{u.username[0].toUpperCase()}</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700}}>{u.username}</div>
            <div className="small">{u.isOnline ? 'Online' : 'Offline'}</div>
          </div>
          <div style={{display:'flex',alignItems:'center'}}>
            <div className="dot" style={{background: u.isOnline ? '#22c55e' : '#94a3b8'}}></div>
          </div>
        </div>
      ))}
    </>
  )
}