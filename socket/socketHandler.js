const User = require('../models/User');
const Message = require('../models/Message');

const handleSocketConnection = (io) => {
    io.on('connection', (socket) => {
        console.log('user connected', socket.id);
        socket.on('join', async (username) => {
            try{  // as soon as the user join, update its socket, make him online
                const user = await User.findOneAndUpdate(
                    { username },
                    { online: true, socketId: socket.id, lastSeen: new Date() },
                );
                socket.join(username);
                socket.broadcast.emit('userJoined',{
                    username,
                    isOnline: true
                });
                console.log(`${username} joined the chat`);
            }catch(err) {
                console.error('Error joining user:', err);
            }
        })
    });

    socket.on('sendMessage', async (data) => {
        try {
            const {senderId, receiverId, content} = data;

             const newMessage = new Message({
                sender: senderId,
                receiver: receiverId,
                content: content.trim()
             });
            await newMessage.save();
            await newMessage.populate('sender', 'username');
            await newMessage.populate('receiver', 'username');

        } catch(err) {
            console.error('Error sending message:', err);
        }
    });


    socket.on('typing', (data) => {
        const { senderId, receiverId } = data;
        socket.to(receiverId).emit('userTyping', {
            senderId,
            isTyping: true
        });
    }); 

    socket.on('stopTyping', (data) => {
        const { senderId, receiverId } = data;
        socket.to(receiverId).emit('userStopTyping', {
            senderId,
            isTyping: false
        });
    });


    socket.on('markAsRead', async (data) => {
        try{ // A->S
            // B->R 
            // B has read A's message
            const { senderId, receiverId } = data;  // A read B' message // B; data should get update
            await Message.updateMany(
                { sender: receiverId, receiver: senderId, isRead: false },
                { $set: { isRead: true } }
            ); // this got updated in DB
            //TODO -> while developing the client i'll send an event or i'll re-use it
            
        } catch(err) {
            console.error('Error marking message as read:', err);
        }
    });


    socket.on('disconnect', async() => {
            try{
                const user = await User.findOneAndUpdate(
                    { socketId: socket.id },
                    { online: false, lastSeen: new Date(), socketId: null },
                );


                socket.broadcast.emit('userDisconnected', {
                    username: user.username,
                    isOnline: false
                });
                console.log(`${user.username} disconnected`);
            } catch(err) {
                console.error('Error on disconnect:', err);
            }
    });

};


module.exports = handleSocketConnection;
