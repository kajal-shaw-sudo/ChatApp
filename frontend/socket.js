import { io } from 'socket.io-client';
export let socket = null;

export const connectSocket = (username) => {
  socket = io('http://localhost:3001', { transports: ['websocket'] });
  socket.on('connect', ()=> {
    socket.emit('userJoined', { username });
  });
}

export const disconnectSocket = () => {
  if(socket){
    socket.disconnect();
    socket = null;
  }
}