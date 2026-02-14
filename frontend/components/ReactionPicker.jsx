import React, { useState } from 'react';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export default function ReactionPicker({ onReact, onClose }) {
  return (
    <>
      {/* Backdrop to close picker */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999
        }}
      />
      
      {/* Reaction Picker */}
      <div style={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: '8px',
        background: 'white',
        borderRadius: '24px',
        padding: '8px 12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        display: 'flex',
        gap: '4px',
        zIndex: 1000,
        animation: 'popIn 0.2s ease'
      }}>
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onReact(emoji);
              onClose();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '12px',
              transition: 'transform 0.2s, background 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.3)';
              e.currentTarget.style.background = '#f3f4f6';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
}