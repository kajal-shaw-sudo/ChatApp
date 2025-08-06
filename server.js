const express = require('express');
const mongoose = require('mongoose');
const socketIO = require('socket.io');
const http = require('http');
const cors = require('cors');
require('dotenv').config();


const connectDB = require('./config/db');
const messageRoutes = require('./routes/messages');
const handleSocketConnection = require('./socket/socketHandler');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

connectDB();

app.use(cors());
app.use(express.json());    

app.use('/api/auth', authRoutes);
// app.use('/api/messages', messageRoutes);



handleSocketConnection(io);



const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});




//HW 
// Code is building properly or not -> some syntax errors or some dependency issues
// try to implement the routes using postman
// try to implement the socket events using socket.io client