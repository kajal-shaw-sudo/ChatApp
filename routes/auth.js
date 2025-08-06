const express = require('express');
const User = require('../models/User');
const router = express.Router();


// Login/Register Route by username only
router.post('/login', async (req, res) => {
    try{
        const { username, email } = req.body;

        // basic validation //length should be between 3 and 30 characters
        if(!username || username.length < 3 || username.length > 30) {
             return res.status(400).json({error:'Username must be between 3 and 30 characters.'});
        }

        let user = await User.findOne({ username });
        if(!user) {
            user = new User({
                username,
                isOnline: true,
                lastSeen: Date.now(),
                email
            });
            await user.save(); // save it to the DB
        }
        else{
            user.isOnline = true; 
            user.lastSeen = Date.now();
            await user.save(); // update the existing user
        }
        res.status(200).json({ message: 'User logged in successfully', user });

    } catch(error){
        console.error('Error logging in:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/logout', async (req, res) => {
    /// what should i do here ?????
    try{
        const { username } = req.body; //:TODO -> try to update this with userId
    const user = await User.findOneAndUpdate(
        { username }, 
        { isOnline: false, 
        lastSeen: Date.now() ,
        socketId : null
    });
    res.status(200).json({ message: 'User logged out successfully', user });
    } catch(error){
        console.error('Error logging out:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//Get all users
router.get('/users', async (req,res) => {
    try{
        const users = await User.find({}, 'username isOnline lastSeen email'); // Fetch only necessary fields for display
        res.status(200).json(users);
    } catch(error){
        console.error('Error fetching users:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;