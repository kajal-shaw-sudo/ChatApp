import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ messages, onDelete, currentUser }) {
  const endRef = useRef();
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const groupByDate = (msgs) => {
    const groups = {};
    msgs.forEach(m => {
      const date = new Date(m.createdAt).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(m);
    });
    return groups;
  };

  const grouped = groupByDate(messages);

  return (
    <>
      {messages.length === 0 && <div className="small">No messages yet. Say hello 👋</div>}
      {Object.entries(grouped).map(([date, msgs]) => (
        <div key={date}>
          <div style={{ textAlign: 'center', margin: '16px 0' }}>
            <span style={{ background: '#e5e7eb', padding: '4px 12px', borderRadius: 12, fontSize: 12, color: '#6b7280' }}>
              {new Date(date).toDateString() === new Date().toDateString() ? 'Today' : date}
            </span>
          </div>
          {msgs.map(m => <MessageBubble key={m._id} msg={m} onDelete={onDelete} currentUser={currentUser} />)}
        </div>
      ))}
      <div ref={endRef} />
    </>
  );
}