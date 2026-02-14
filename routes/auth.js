const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const { uploadProfile } = require('../config/cloudinary');

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

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || username.length < 3) return res.status(400).json({ error: 'Username 3+ chars' });
    if (!email?.match(/.+\@.+\..+/)) return res.status(400).json({ error: 'Valid email required' });
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password 6+ chars' });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ error: existing.email === email ? 'Email taken' : 'Username taken' });

    const user = await User.create({ username, email, password: await bcrypt.hash(password, 10) });
    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ user: { _id: user._id, username: user.username, email: user.email, profilePicture: user.profilePicture }, token });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Invalid credentials' });
    user.isOnline = true;
    await user.save();
    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ user: { _id: user._id, username: user.username, email: user.email, profilePicture: user.profilePicture, isOnline: true }, token });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

/*
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}?error=auth_failed`, session: false }), (req, res) => {
  const token = jwt.sign({ userId: req.user._id, username: req.user.username }, process.env.JWT_SECRET, { expiresIn: '30d' });
  const user = { _id: req.user._id, username: req.user.username, email: req.user.email, profilePicture: req.user.profilePicture };
  res.redirect(`${process.env.FRONTEND_URL}?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
});
*/

router.post('/logout', authMiddleware, async (req, res) => {
  await User.findByIdAndUpdate(req.userId, { isOnline: false, lastSeen: new Date() });
  res.json({ message: 'Logged out' });
});

router.get('/users', authMiddleware, async (req, res) => {
  const users = await User.find({}, 'username email profilePicture isOnline lastSeen');
  res.json(users);
});

router.post('/upload-profile-picture', authMiddleware, uploadProfile.single('profilePicture'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const user = await User.findByIdAndUpdate(req.userId, { profilePicture: req.file.path }, { new: true }).select('-password');
  res.json({ user });
});

router.put('/update-profile', authMiddleware, async (req, res) => {
  const { username, email } = req.body;
  const updates = {};
  if (username) updates.username = username;
  if (email) updates.email = email;
  const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
  const token = username ? jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '30d' }) : null;
  res.json({ user, token });
});

router.put('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.userId);
  if (!(await bcrypt.compare(currentPassword, user.password))) return res.status(401).json({ error: 'Wrong password' });
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password changed' });
});

module.exports = router;