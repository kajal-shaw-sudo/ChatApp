const express = require('express');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');

const router = express.Router();

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/conversation/:user1/:user2', authMiddleware, async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    })
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture')
      .sort({ createdAt: 1 })
      .lean();

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:messageId', authMiddleware, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.messageId);
    if (!msg || msg.sender.toString() !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    await Message.findByIdAndDelete(req.params.messageId);
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
});

router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { query, userId } = req.query;
    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: userId },
        { sender: userId, receiver: req.userId }
      ],
      content: { $regex: query, $options: 'i' }
    })
      .populate('sender receiver', 'username profilePicture')
      .limit(20)
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
});

router.put('/:messageId/read', authMiddleware, async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.messageId, { isRead: true, readAt: new Date() });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;