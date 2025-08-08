import React from 'react';

export default function MessageBubble({ msg }){
  return (
    <div style={{display:'flex', flexDirection:'column', alignItems: msg.isMine ? 'flex-end' : 'flex-start'}}>
      <div className={'bubble ' + (msg.isMine ? 'me' : 'them')}>
        {msg.text}
      </div>
      <div className="small" style={{color:'#94a3b8'}}>
        {new Date(msg.createdAt || Date.now()).toLocaleTimeString()}
      </div>
    </div>
  )
}