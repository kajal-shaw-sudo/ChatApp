import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import api from './services/api';
import { socket, connectSocket, disconnectSocket } from './services/socket';

export default function App(){
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(()=>{
    console.log('App mounted');
    if(user){
      // fetch users
      api.getUsers().then(res=>setUsers(res.data || []));
      connectSocket(user.username);

      // Add a generic listener to see all events
      socket.onAny((eventName, ...args) => {
        console.log(`Socket event received: ${eventName}`, args);
      });

      socket.on('userOnline', (u)=>{  
        setUsers(prev=>{          
          const found = prev.find(p=>p.username===u.username);
          if(found) {
            return prev.map(p=> p.username===u.username ? {...p, isOnline: true} : p);
          }
          return [{...u, isOnline: true}, ...prev];
        });
      });

      socket.on('newMessage', (msg)=>{  
        console.log('New message received:', msg);
        // Check if message belongs to any conversation with current user
        if(msg.sender === user._id || msg.receiver === user._id) {
          // Only add to current chat if it matches selected user
          setMessages(prev => {
            // Get current selectedUser from the latest state
            const currentSelected = selectedUser;
            if(!currentSelected) return prev;
            
            if((msg.sender === currentSelected._id && msg.receiver === user._id) ||
               (msg.sender === user._id && msg.receiver === currentSelected._id)) {
              return [...prev, {...msg, isMine: msg.sender === user._id}];
            }
            return prev;
          });
        }
      });

      socket.on('messageSent', (msg)=>{
        console.log('Message sent confirmation received:', msg);
        setMessages(prev=>{
          console.log('Current messages before adding sent message:', prev.length);
          const newMessages = [...prev, {...msg, isMine:true}];
          console.log('Messages after adding sent message:', newMessages.length);
          return newMessages;
        });
      });

      return ()=>{
        socket.off('userOnline');
        socket.off('newMessage');
        socket.off('messageSent');
        disconnectSocket();
      }
    }
  }, [user, selectedUser]); // Removed 'messages' from dependency array

  const onLogin = async (username) => {
    const res = await api.login({ username });
    console.log(res);
    if(res.data && res.data.user){
      res.data.user.isOnline = true;
      setUser(res.data.user); // mark user as online
      // refresh users
      const ures = await api.getUsers();
      setUsers(ures.data || []);
    }
  };

  const onSelectUser = async (u) => {
    setSelectedUser(u);
    // load conversation
    try{
      const res = await api.getConversation(user._id, u._id);
      const msgs = (res.data && res.data.messages) || []; // from result i will extract messages
      // mark isMine
      setMessages(msgs.map(m=>({...m, isMine: m.sender===user._id})));// iterating over messages to set isMine property
    }catch(e){
      console.error(e);
      setMessages([]);
    }
  };

  const onSend = (text) => {
    console.log('Attempting to send message:', text);
    if(!selectedUser) {
      console.log('No user selected');
      return;
    }
    if(!socket) {
      console.log('Socket not connected');
      return;
    }
    if(!socket.connected) {
      console.log('Socket disconnected');
      return;
    }
    
    const messageData = {
      sender: user._id,
      receiver: selectedUser._id,
      text
    };
    
    console.log('Emitting sendMessage with:', messageData);
    
    // Add optimistic update - show message immediately
    setMessages(prev => [...prev, {
      ...messageData,
      _id: Date.now(), // temporary ID
      timestamp: new Date(),
      isMine: true,
      pending: true // mark as pending
    }]);
    
    socket.emit('sendMessage', messageData);
  };

  if(!user) return (
    <div className="app centered">
      <Login onLogin={onLogin} />
    </div>
  );

  return (
    <div className="app">
      <div className="chat-app">
        <div className="sidebar">
          <div className="brand">ChatApp</div>
          <div className="user-list">
            <Sidebar users={users} onSelectUser={onSelectUser} selectedUser={selectedUser} />
          </div>
        </div>
        <div className="main">
          <div className="header">
            {selectedUser ? (
              <>
                <div className="avatar">{selectedUser.username[0].toUpperCase()}</div>
                <div>
                  <div style={{fontWeight:700}}>{selectedUser.username}</div>
                  <div className="small">{selectedUser.online ? 'Online' : 'Offline'}</div>
                </div>
              </>
            ) : (
              <div style={{color:'#cbd5e1'}}>Select a user to start chatting</div>
            )}
          </div>
          <div className="messages">
            <ChatWindow messages={messages} />
          </div>
          <div className="input-area">
            <input className="input" placeholder={ selectedUser ? 'Message ' + selectedUser.username : 'Select a user' } onKeyDown={(e)=> {
              if(e.key==='Enter'){
                const txt = e.target.value.trim();
                if(txt){ onSend(txt); e.target.value=''; }
              }
            }} disabled={!selectedUser} />
            <button className="button" onClick={()=>{
              const inp = document.querySelector('.input');
              const txt = inp.value.trim();
              if(txt){ onSend(txt); inp.value='';}
            }} disabled={!selectedUser}>Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}




// 2 mistake
// our object isOnline property but we were checking online property
// we were not updating the user status in the users list properly when a user comes online