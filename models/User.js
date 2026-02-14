const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: /.+\@.+\..+/
    },
    password:{
        type: String,
        required: true,
        minlength: 6
    },
    profilePicture:{
        type: String,
        default: null
    },
    googleId:{
        type: String,
        default: null
    },
    isOnline:{
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    socketId:{
        type: String,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);