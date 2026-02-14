const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Unauthorized'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Socket auth success:', socket.user.username);
      next();
    } catch (err) {
      console.error('❌ Socket auth failed:', err);
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', async (socket) => {
    console.log('🔌 User connected:', socket.user.username, socket.id);
    
    try {
      await User.findByIdAndUpdate(socket.user.userId, { 
        isOnline: true, 
        socketId: socket.id 
      });
      socket.join(socket.user.userId);
      socket.broadcast.emit('userJoined', { 
        userId: socket.user.userId, 
        username: socket.user.username 
      });
    } catch (err) {
      console.error('❌ Error updating user status:', err);
    }

    socket.on('sendMessage', async (data, callback) => {
      console.log('📤 sendMessage event received:', data);
      
      try {
        const newMessage = new Message({
          sender: socket.user.userId,
          receiver: data.receiverId,
          content: data.content || '',
          fileUrl: data.fileUrl,
          fileType: data.fileType,
          fileName: data.fileName,
          reactions: []
        });

        await newMessage.save();
        console.log('✅ Message saved to DB:', newMessage._id);

        // Populate sender and receiver
        await newMessage.populate('sender', 'username profilePicture');
        await newMessage.populate('receiver', 'username profilePicture');

        const messageObj = newMessage.toObject();
        console.log('📨 Message populated:', messageObj);

        // Send to receiver if different from sender
        if (data.receiverId !== socket.user.userId) {
          io.to(data.receiverId).emit('receiveMessage', messageObj);
          console.log('📨 Message sent to receiver:', data.receiverId);
        }

        // Send success response back to sender
        callback(messageObj);
        console.log('✅ Callback sent to sender');

      } catch (err) {
        console.error('❌ sendMessage error:', err);
        callback({ error: err.message || 'Failed to send message' });
      }
    });

    socket.on('typing', (data) => {
      console.log('⌨️ Typing:', socket.user.username, '→', data.receiverId);
      io.to(data.receiverId).emit('userTyping', { userId: socket.user.userId });
    });

    socket.on('stopTyping', (data) => {
      console.log('🛑 Stop typing:', socket.user.username);
      io.to(data.receiverId).emit('userStopTyping', { userId: socket.user.userId });
    });

    socket.on('reactionUpdate', (data) => {
      console.log('😀 Reaction update:', data);
      io.to(data.receiverId).emit('reactionUpdated', {
        messageId: data.messageId,
        reactions: data.reactions
      });
    });

    socket.on('deleteMessage', async (data) => {
      try {
        await Message.findByIdAndDelete(data.messageId);
        io.to(data.receiverId).emit('messageDeleted', { messageId: data.messageId });
      } catch (err) {
        console.error('❌ Delete message error:', err);
      }
    });

    socket.on('disconnect', async () => {
      console.log('🔌 User disconnected:', socket.user.username);
      try {
        const user = await User.findOneAndUpdate(
          { socketId: socket.id }, 
          { isOnline: false, lastSeen: new Date(), socketId: null }
        );
        if (user) {
          socket.broadcast.emit('userDisconnected', { 
            userId: user._id, 
            username: user.username 
          });
        }
      } catch (err) {
        console.error('❌ Error on disconnect:', err);
      }
    });
  });
};