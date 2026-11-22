# 💬 ChatApp: Real-Time Chat Application

A full-stack, one-to-one real-time chat app built with React, Node.js, Express, Socket.io and MongoDB.

**Live demo:** https://chatapp-one-rho.vercel.app
(The backend runs on Render's free tier, so the first request after a period of inactivity can take up to a minute while the server wakes up.)

## ✨ Features

- 🔐 **Two login methods:** email/password (bcrypt-hashed) and Google OAuth 2.0 (Passport.js). Both issue a JWT.
- 💬 **Real-time messaging:** Socket.io with delivery acknowledgements; messages are saved to MongoDB.
- ⌨️ **Typing indicators**
- 🟢 **Online status:** see who's online in real time; last-seen time is stored when a user disconnects
- 😊 **Message reactions:** react with 6 emojis (👍 ❤️ 😂 😮 😢 🙏)
- ✅ **Read state:** messages track `isRead` and `readAt`
- 📎 **File and image sharing:** uploads through Multer to Cloudinary
- 🖼️ **Profile pictures** via Cloudinary
- 🔍 **Message search** within a conversation
- 🗑️ **Delete your own messages**
- 📱 **Responsive layout**

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Socket.io Client, Axios, React Icons
**Backend:** Node.js, Express, Socket.io, MongoDB, Mongoose
**Auth:** JWT, bcryptjs, Passport.js (Google OAuth 2.0)
**Storage:** Cloudinary, Multer
**Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)

## 🏗️ How It Works

- One JWT authenticates both REST requests (`Authorization: Bearer ...`) and the Socket.io handshake (`auth: { token }`).
- Each user joins a Socket.io room named after their user ID, so messages are delivered to the receiver's room.
- `sendMessage` saves the message first, then emits it to the receiver and sends an acknowledgement back to the sender.

## 🔒 Security Notes

- Passwords are hashed with bcrypt; secrets are read from environment variables.
- All message routes require a valid JWT.
- Conversation history can only be fetched by one of its two participants.
- Message deletion through the REST API is limited to the message's sender.

## ⚡ Benchmark: Conversation Query Index

The `Message` model has a compound index on `(sender, receiver, createdAt)`, matching the conversation query. To check its effect, `scripts/benchmark-messages.js` seeds an in-memory MongoDB and runs the real query with and without the index.

| Dataset: 200,000 messages (local, in-memory MongoDB) | Without index | With index |
|---|---|---|
| Documents examined | 200,000 | 200 |
| Median query time | ~123 ms | < 1 ms |
| Messages returned | 200 | 200 |

Run it yourself:

```bash
npm install
node scripts/benchmark-messages.js
```

**Limits of this test:** the data is synthetic, the database is local and in-memory, and the cache is warm. It measures MongoDB's query execution time, not what a user sees over the network. It doesn't apply to the search route, which uses a case-insensitive regex on message content.

## 🚧 Known Limitations

- Sessions use Express's default in-memory store, so they reset on every server restart.
- Each user has a single stored `socketId`, so multiple tabs or devices are not handled correctly.
- The conversation endpoint returns the full history with no pagination.
- Message search uses an unindexed regex and may be slow on large conversations.
- There is no rate limiting on login or message routes.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB (local or Atlas)
- A Cloudinary account
- Google OAuth credentials (optional, only for Google login)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/kajal-shaw-sudo/ChatApp.git
cd ChatApp
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd frontend
npm install
cd ..
```

4. **Create a `.env` file in the root directory**
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_min_32_chars
PORT=5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

5. **Create `frontend/.env.development`**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Running the Application

1. **Start the backend**
```bash
npm run dev
```
Runs on http://localhost:5000

2. **Start the frontend (in a new terminal)**
```bash
cd frontend
npm run dev
```
Runs on http://localhost:5173

## 📸 Screenshots

### Chat Interface
<img width="1843" height="862" alt="image" src="https://github.com/user-attachments/assets/ddca3086-6ad5-48ab-a6f0-64ed921e82f7" />

### Profile Settings
<img width="1843" height="867" alt="image" src="https://github.com/user-attachments/assets/7ad24a38-a24f-4ba8-9018-736771fb2d47" />

### Message Reactions
<img width="472" height="170" alt="image" src="https://github.com/user-attachments/assets/6e4b0574-d748-4d92-b704-554f061ad9ad" />

## 🔧 Configuration

### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create or select a project.
2. Configure the OAuth consent screen.
3. Create an OAuth client ID of type "Web application".
4. Add authorized redirect URIs:
   - Development: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://your-backend-url.com/api/auth/google/callback`

### Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com/).
2. Copy your Cloud Name, API Key and API Secret from the dashboard.
3. Add them to your `.env` file.

## 📂 Project Structure

```
ChatApp/
├── config/
│   ├── cloudinary.js      # Cloudinary and Multer storage
│   ├── database.js        # MongoDB connection
│   └── passport.js        # Google OAuth strategy
├── models/
│   ├── User.js
│   └── Message.js         # includes the compound index
├── routes/
│   ├── auth.js            # signup, login, Google OAuth, profile
│   ├── messages.js        # conversation, search, delete, read
│   ├── reactions.js
│   └── files.js
├── socket/
│   └── socketHandler.js   # Socket.io events
├── scripts/
│   └── benchmark-messages.js
├── frontend/
│   └── src/
│       ├── components/
│       ├── services/      # API and socket clients
│       └── App.jsx
└── server.js              # Express entry point
```

## 🌐 Deployment

- **Backend (Render):** create a Web Service from this repo and add the environment variables from the `.env` block above.
- **Frontend (Vercel):** import the repo, set the root directory to `frontend`, and add `VITE_API_URL` and `VITE_SOCKET_URL` pointing to your backend.

## 👩‍💻 Author

**Kajal Shaw**: [GitHub](https://github.com/kajal-shaw-sudo)
