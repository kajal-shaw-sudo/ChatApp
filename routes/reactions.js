const express = require('express');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');

const router = express.Router();

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/:messageId/react', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.userId;

    console.log('=== REACTION REQUEST ===');
    console.log('Message ID:', messageId);
    console.log('Emoji:', emoji);
    console.log('User ID:', userId);

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji required' });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    console.log('Current reactions:', message.reactions);

    // Check if user already reacted with THIS emoji
    const existingReactionIndex = message.reactions.findIndex(
      r => r.userId.toString() === userId && r.emoji === emoji
    );

    if (existingReactionIndex !== -1) {
      // Remove this specific reaction (toggle off)
      message.reactions.splice(existingReactionIndex, 1);
      console.log('Removed reaction');
    } else {
      // Remove any OTHER reactions from this user first
      message.reactions = message.reactions.filter(
        r => r.userId.toString() !== userId
      );
      
      // Add new reaction
      message.reactions.push({ userId, emoji });
      console.log('Added new reaction');
    }

    await message.save();

    console.log('Updated reactions:', message.reactions);

    res.json({
      message: 'Reaction updated',
      reactions: message.reactions,
      messageId: message._id
    });

  } catch (error) {
    console.error('Reaction error:', error);
    res.status(500).json({ error: 'Failed to update reaction' });
  }
});

module.exports = router;