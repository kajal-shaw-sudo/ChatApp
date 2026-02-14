const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    fileUrl: { type: String },
    fileType: { type: String },
    fileName: { type: String },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    reactions: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, emoji: String }]
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);