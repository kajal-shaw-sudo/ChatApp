import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ messages }){
  const endRef = useRef();
  useEffect(()=> endRef.current?.scrollIntoView({behavior:'smooth'}), [messages]);
  return (
    <>
      {messages.length===0 && <div className="small">No messages yet. Say hello 👋</div>}
      {messages.map((m,i)=> <MessageBubble key={i} msg={m} />)}
      <div ref={endRef} />
    </>
  )
}