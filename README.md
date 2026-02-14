# 💬 ChatApp - Real-Time Chat Application

A modern, full-stack real-time chat application built with React, Node.js, Socket.io, and MongoDB.

## ✨ Features

- 🔐 **Authentication**: Email/Password & Google OAuth 2.0
- 💬 **Real-time Messaging**: Instant message delivery with Socket.io
- 📎 **File Sharing**: Upload and share images and files
- 😊 **Message Reactions**: React to messages with 6 emojis (👍❤️😂😮😢🙏)
- ⌨️ **Typing Indicators**: See when others are typing
- 🖼️ **Profile Pictures**: Upload custom profile pictures via Cloudinary
- 🔍 **Message Search**: Search through conversation history
- 🗑️ **Delete Messages**: Remove your own messages
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- 👥 **Online Status**: See who's online in real-time
- 📊 **Grouped Date Headers**: Messages organized by date (Today, Yesterday, etc.)

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Icons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **Passport.js** - Google OAuth
- **Cloudinary** - File/image storage
- **Bcrypt** - Password hashing

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Google OAuth credentials (optional)

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

4. **Create .env file in root directory**
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

5. **Create frontend/.env.development**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Running the Application

1. **Start the backend server**
```bash
npm run dev
```
Backend runs on http://localhost:5000

2. **Start the frontend (in a new terminal)**
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173

3. **Open your browser**
Navigate to http://localhost:5173

## 📸 Screenshots

### Chat Interface
<img width="1843" height="862" alt="image" src="https://github.com/user-attachments/assets/ddca3086-6ad5-48ab-a6f0-64ed921e82f7" />

### Profile Settings
<img width="1843" height="867" alt="image" src="https://github.com/user-attachments/assets/7ad24a38-a24f-4ba8-9018-736771fb2d47" />

### Message Reactions
<img width="472" height="170" alt="image" src="https://github.com/user-attachments/assets/6e4b0574-d748-4d92-b704-554f061ad9ad" />


## 🔧 Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://your-backend-url.com/api/auth/google/callback`

### Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret from dashboard
3. Add to .env file

## 📂 Project Structure
```
ChatApp/
├── config/
│   ├── cloudinary.js      # Cloudinary configuration
│   ├── database.js         # MongoDB connection
│   └── passport.js         # Passport OAuth config
├── models/
│   ├── User.js            # User schema
│   └── Message.js         # Message schema
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── messages.js        # Message routes
│   ├── reactions.js       # Reaction routes
│   └── files.js           # File upload routes
├── socket/
│   └── socketHandler.js   # Socket.io event handlers
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API & Socket services
│   │   ├── App.jsx        # Main app component
│   │   └── index.css      # Global styles
│   └── package.json
├── server.js              # Express server entry point
├── .env                   # Environment variables
└── package.json
```

## 🌐 Deployment

### Backend (Render/Railway)
1. Push code to GitHub
2. Create new Web Service on Render
3. Add environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Set root directory to `frontend`
3. Add environment variables
4. Deploy

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 👨‍💻 Author

**Kajal Shaw**
- GitHub: [@kajal-shaw-sudo](https://github.com/kajal-shaw-sudo)

---

⭐ **Star this repo if you found it helpful!**
