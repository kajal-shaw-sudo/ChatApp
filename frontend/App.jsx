import React, { useEffect, useState, useRef } from 'react';
import { FiSettings, FiSearch, FiPaperclip, FiX } from 'react-icons/fi';
import Login from './components/Login';
import Signup from './components/Signup';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ProfileSettings from './components/ProfileSettings';
import api from './services/api';
import { connectSocket, disconnectSocket, getSocket } from './services/socket';

export default function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showSignup, setShowSignup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    if (token && userStr) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', userStr);
      setUser(JSON.parse(decodeURIComponent(userStr)));
      window.history.replaceState({}, '', '/');
    } else {
      const saved = localStorage.getItem('user');
      if (saved) setUser(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const loadUsers = async () => {
      try {
        const res = await api.getUsers();
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    };

    loadUsers();
    const socket = connectSocket();

    socket.on('connect', () => {
      console.log('Socket connected');
      loadUsers(); // Refresh users on reconnect
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('receiveMessage', msg => {
      console.log('Received message:', msg);
      if (msg.receiver._id === user._id) {
        setMessages(prev => [...prev, { ...msg, isMine: false }]);
      }
    });

    socket.on('userTyping', data => {
  console.log('User typing event:', data, 'Selected user:', selectedUser?._id);
  if (selectedUser?._id === data.userId) {
    console.log('Setting typing to true');
    setIsTyping(true);
  }
});

socket.on('userStopTyping', data => {
  console.log('User stop typing event:', data);
  if (selectedUser?._id === data.userId) {
    console.log('Setting typing to false');
    setIsTyping(false);
  }
});

    socket.on('messageDeleted', data => {
      setMessages(prev => prev.filter(m => m._id !== data.messageId));
    });

    socket.on('userJoined', data => {
      console.log('User joined:', data);
      setUsers(prev => prev.map(u => u._id === data.userId ? { ...u, isOnline: true } : u));
    });

    socket.on('userDisconnected', data => {
      console.log('User disconnected:', data);
      setUsers(prev => prev.map(u => u._id === data.userId ? { ...u, isOnline: false } : u));
    });

    socket.on('reactionUpdated', data => {
  console.log('📨 Reaction updated received:', data);
  setMessages(prev => prev.map(m => 
    m._id === data.messageId ? { ...m, reactions: data.reactions } : m
  ));
});

    // Refresh users every 10 seconds to sync online status
    const interval = setInterval(loadUsers, 10000);

    return () => {
      clearInterval(interval);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('receiveMessage');
      socket.off('userTyping');
      socket.off('userStopTyping');
      socket.off('messageDeleted');
      socket.off('userJoined');
      socket.off('userDisconnected');
      socket.off('reactionUpdated');
    };
  }, [user, selectedUser]);

  const onSelectUser = async (u) => {
    setSelectedUser(u);
    setMessages([]);
    setShowSearch(false);
    setIsTyping(false);
    
    try {
    const res = await api.getConversation(user._id, u._id);
    setMessages(res.data.map(m => ({ ...m, isMine: m.sender._id === user._id })));
  } catch (err) {
    console.error('Failed to load conversation:', err);
  }
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (!socket || !selectedUser) return;
    
    socket.emit('typing', { receiverId: selectedUser._id });
    
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      socket.emit('stopTyping', { receiverId: selectedUser._id });
    }, 2000);
    setTypingTimeout(timeout);
  };

  const onSend = (text, fileData = null) => {
  const socket = getSocket();
  if (!socket?.connected || !selectedUser) {
    alert('Not connected to server. Please refresh the page.');
    return;
  }
  if (!text?.trim() && !fileData) return;

  const messageData = {
    receiverId: selectedUser._id,
    content: text || '',
    ...(fileData && { fileUrl: fileData.fileUrl, fileType: fileData.fileType, fileName: fileData.fileName })
  };

  console.log('📤 Sending message:', messageData);

  socket.emit('sendMessage', messageData, (response) => {
    console.log('✅ Server response:', response);
    
    if (response && !response.error) {
      setMessages(prev => [...prev, { ...response, isMine: true }]);
      console.log('✅ Message added to state');
    } else {
      console.error('❌ Message send failed:', response);
      alert('Failed to send message: ' + (response?.error || 'Unknown error'));
    }
  });

  if (typingTimeout) clearTimeout(typingTimeout);
  socket.emit('stopTyping', { receiverId: selectedUser._id });
};


  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.uploadFile(formData);
      console.log('File uploaded:', res.data);
      onSend(`📎 ${file.name}`, res.data);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query || !selectedUser) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await api.searchMessages(query, selectedUser._id);
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Delete this message?')) return;
    
    try {
      await api.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m._id !== messageId));
      const socket = getSocket();
      socket.emit('deleteMessage', { messageId, receiverId: selectedUser._id });
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Delete failed');
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.clear();
    disconnectSocket();
    setUser(null);
  };

  const getUnreadCount = (userId) => {
    return 0; // Simplified for now
  };

  if (!user) {
    return (
      <div className="app centered">
        {showSignup ? (
          <Signup
            onSignup={async p => {
              const r = await api.signup(p);
              localStorage.setItem('token', r.data.token);
              localStorage.setItem('user', JSON.stringify(r.data.user));
              setUser(r.data.user);
            }}
            onSwitch={() => setShowSignup(false)}
          />
        ) : (
          <Login
            onLogin={async p => {
              const r = await api.login(p);
              localStorage.setItem('token', r.data.token);
              localStorage.setItem('user', JSON.stringify(r.data.user));
              setUser(r.data.user);
            }}
            onSwitch={() => setShowSignup(true)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app">
      {uploading && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Uploading file...</div>
            <div className="small">Please wait</div>
          </div>
        </div>
      )}

      <div className="chat-app">
        <div className="sidebar">
          <div className="brand">💬 ChatApp</div>
          <div style={{ padding: 20, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderBottom: '3px solid #5a67d8' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div className="avatar" style={{ width: 56, height: 56, fontSize: 22, backgroundImage: user.profilePicture ? `url(${user.profilePicture})` : 'none', backgroundSize: 'cover', border: '3px solid white' }}>
                {!user.profilePicture && user.username[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'white' }}>{user.username}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>{user.email}</div>
              </div>
            </div>
            <button onClick={() => setShowSettings(true)} style={{ width: '100%', padding: 10, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <FiSettings size={16} />Profile Settings
            </button>
          </div>
          <div style={{ padding: '16px 12px 8px', background: '#f8f9fa', borderBottom: '2px solid #e5e7eb' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>MESSAGES</div>
          </div>
          <div className="user-list">
            <Sidebar users={users} onSelectUser={onSelectUser} selectedUser={selectedUser} currentUser={user} getUnreadCount={getUnreadCount} />
          </div>
        </div>

        <div className="main">
          {selectedUser ? (
            <>
              <div className="header">
                <div className="avatar" style={{ backgroundImage: selectedUser.profilePicture ? `url(${selectedUser.profilePicture})` : 'none', backgroundSize: 'cover' }}>
                  {!selectedUser.profilePicture && selectedUser.username[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{selectedUser.username}</div>
                  <div className="small">
                    {isTyping ? (
                      <span style={{ color: '#667eea', fontStyle: 'italic' }}>
                        <span className="typing-dots">typing</span>
                        <span className="typing-dot">.</span>
                        <span className="typing-dot">.</span>
                        <span className="typing-dot">.</span>
                      </span>
                    ) : selectedUser.isOnline ? (
                      '🟢 Online'
                    ) : (
                      `⚫ Last seen ${selectedUser.lastSeen ? new Date(selectedUser.lastSeen).toLocaleString() : 'recently'}`
                    )}
                  </div>
                </div>
                <button onClick={() => setShowSearch(!showSearch)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 8 }}>
                  <FiSearch size={20} color="#667eea" />
                </button>
              </div>

              {showSearch && (
                <div style={{ padding: 12, background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <input
                    className="input"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={e => handleSearch(e.target.value)}
                    style={{ width: '100%' }}
                  />
                  {searchResults.length > 0 && (
                    <div style={{ marginTop: 8, maxHeight: 200, overflow: 'auto', background: 'white', borderRadius: 8, padding: 8 }}>
                      {searchResults.map(m => (
                        <div key={m._id} style={{ padding: 8, cursor: 'pointer', borderBottom: '1px solid #e5e7eb' }} onClick={() => {
                          setSearchQuery('');
                          setShowSearch(false);
                        }}>
                          {m.content.substring(0, 50)}...
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="messages">
                <ChatWindow messages={messages} onDelete={handleDeleteMessage} currentUser={user} />
              </div>

              <div className="input-area">
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={uploading}
                  style={{ background: 'transparent', border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', padding: 8, opacity: uploading ? 0.5 : 1 }}
                >
                  <FiPaperclip size={20} color="#667eea" />
                </button>
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <input
                  className="input"
                  placeholder={`Message ${selectedUser.username}...`}
                  disabled={uploading}
                  onChange={handleTyping}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && e.target.value.trim() && !uploading) {
                      onSend(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  className="button"
                  disabled={uploading}
                  onClick={() => {
                    const inp = document.querySelector('.input');
                    if (inp.value.trim()) {
                      onSend(inp.value);
                      inp.value = '';
                    }
                  }}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <h3>Welcome to ChatApp</h3>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>

      {showSettings && (
        <ProfileSettings
          user={user}
          onClose={() => setShowSettings(false)}
          onUpdate={u => {
            setUser(u);
            localStorage.setItem('user', JSON.stringify(u));
          }}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}