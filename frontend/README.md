# Chat Frontend

This is a simple React + Vite frontend that works with the provided Node/Socket.IO backend.

## How to run

1. Install dependencies
```bash
cd chat_frontend
npm install
```

2. Start the dev server
```bash
npm run dev
```

3. Make sure your backend is running on http://localhost:5000

## Notes

- The frontend expects these backend endpoints/websocket behavior:
  - REST: POST /api/auth/login, POST /api/auth/logout, GET /api/auth/users, GET /api/messages/conversation/:u1/:u2
  - Socket.io events: emit 'userJoined' with `{ username }`, emit 'sendMessage' with `{ sender, receiver, text }`, listen for 'userOnline', 'newMessage', 'messageSent'