require('dotenv').config();
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const connectDB = require('./config/database');
const messageRoutes = require('./routes/messages');
const reactionRoutes = require('./routes/reactions');
const fileRoutes = require('./routes/files');
const handleSocketConnection = require('./socket/socketHandler');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { 
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
    methods: ['GET', 'POST'] 
  }
});

connectDB();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: false, cookie: { maxAge: 24 * 60 * 60 * 1000 } }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/files', fileRoutes);

handleSocketConnection(io);

server.listen(process.env.PORT || 5000, () => console.log(`Server on port ${process.env.PORT || 5000}`));