const express = require('express');
const Message = require('../models/Message');
const router = express.Router();


// get conversation between two users 
router.get('/conversation/:user1/:user2', async(req, res) => {
        try{
            const {user1, user2} = req.params;
            const messages = await Message.find({
                $or :[
                    { sender: user1, receiver: user2 },
                    { sender: user2, receiver: user1 }
                ]
            }).populate('sender', 'username')
              .populate('receiver', 'username')
              .limit(100); 

        } catch(err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
});



//sending a message
// router.post('/send',async(req,res) => {
//     // what details i'll be gettting from req body here???
//     try{
//          const  {senderId, receiverId, content} = req.body;
//          if(!senderId || !receiverId || !content) {
//             return res.status(400).json({ error: 'All fields are required' });
//          }

//          const newMessage = new Message({
//             sender: senderId,
//             receiver: receiverId,
//             content: content.trim()
//          });
//          await newMessage.save();
//          await newMessage.populate('sender', 'username')   
//          await newMessage.populate('receiver', 'username');

//     } catch(err){
//         console.error(err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

//:TODO add a mark as read endpoint

module.exports = router;