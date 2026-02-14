import React, { useState } from 'react';
import { FiTrash2, FiDownload, FiSmile } from 'react-icons/fi';
import api from '../services/api';
import { getSocket } from '../services/socket';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export default function MessageBubble({ msg, onDelete, currentUser }) {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [localReactions, setLocalReactions] = useState(msg.reactions || []);

  const handleReact = async (emoji) => {
    try {
      console.log('Reacting with:', emoji, 'to message:', msg._id);
      const res = await api.addReaction(msg._id, emoji);
      console.log('Reaction response:', res.data);
      
      // Update local state immediately for instant UI feedback
      setLocalReactions(res.data.reactions);
      
      // Emit socket event to other user
      const socket = getSocket();
      if (socket?.connected) {
        const receiverId = msg.sender._id === currentUser._id ? msg.receiver._id : msg.sender._id;
        socket.emit('reactionUpdate', {
          messageId: msg._id,
          reactions: res.data.reactions,
          receiverId: receiverId
        });
        console.log('Reaction socket event emitted');
      }
      
      setShowReactions(false);
    } catch (err) {
      console.error('Reaction failed:', err.response?.data || err.message);
      alert('Reaction failed: ' + (err.response?.data?.error || err.message));
    }
  };

  // Use local reactions if available, fallback to msg.reactions
  const reactionsToDisplay = localReactions.length > 0 ? localReactions : (msg.reactions || []);

  const groupedReactions = {};
  if (reactionsToDisplay.length > 0) {
    reactionsToDisplay.forEach(r => {
      if (!groupedReactions[r.emoji]) {
        groupedReactions[r.emoji] = 0;
      }
      groupedReactions[r.emoji]++;
    });
  }

  return (
    <div
      id={`msg-${msg._id}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: msg.isMine ? 'flex-end' : 'flex-start', marginBottom: 8, position: 'relative' }}
    >
      {msg.fileUrl && (
        <div style={{ marginBottom: 8 }}>
          {msg.fileType?.startsWith('image/') ? (
            <img src={msg.fileUrl} alt={msg.fileName} style={{ maxWidth: 300, maxHeight: 300, borderRadius: 12, cursor: 'pointer' }} onClick={() => window.open(msg.fileUrl, '_blank')} />
          ) : (
            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f3f4f6', padding: 12, borderRadius: 12, textDecoration: 'none', color: '#1f2937' }}>
              <FiDownload size={20} />
              <span>{msg.fileName || 'Download file'}</span>
            </a>
          )}
        </div>
      )}
      
      <div style={{ position: 'relative' }}>
        {msg.content && (
          <div className={'bubble ' + (msg.isMine ? 'me' : 'them')}>
            {msg.content}
          </div>
        )}

        {showActions && (
          <div style={{ position: 'absolute', top: -8, right: msg.isMine ? -8 : 'auto', left: msg.isMine ? 'auto' : -8, display: 'flex', gap: 4 }}>
            <button onClick={() => setShowReactions(!showReactions)} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <FiSmile size={14} color="#667eea" />
            </button>
            {msg.isMine && (
              <button onClick={() => onDelete(msg._id)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <FiTrash2 size={14} />
              </button>
            )}
          </div>
        )}

        {showReactions && (
          <>
            <div onClick={() => setShowReactions(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} />
            <div style={{ position: 'absolute', top: -50, right: msg.isMine ? 0 : 'auto', left: msg.isMine ? 'auto' : 0, background: 'white', borderRadius: 24, padding: '8px 12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'flex', gap: 4, zIndex: 999 }}>
              {EMOJIS.map(emoji => (
                <button key={emoji} onClick={() => handleReact(emoji)} style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', padding: '4px 8px', borderRadius: 12, transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.3)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}

        {Object.keys(groupedReactions).length > 0 && (
          <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <div key={emoji} onClick={() => handleReact(emoji)} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '2px 8px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <span>{emoji}</span>
                {count > 1 && <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{count}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="small" style={{ color: '#94a3b8', marginTop: 4 }}>
        {new Date(msg.createdAt).toLocaleTimeString()}
      </div>
    </div>
  );
}