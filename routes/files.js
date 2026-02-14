const express = require('express');
const jwt = require('jsonwebtoken');
const { uploadFile } = require('../config/cloudinary');

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

router.post('/upload', authMiddleware, uploadFile.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    res.json({
      fileUrl: req.file.path,
      fileType: req.file.mimetype,
      fileName: req.file.originalname
    });
  } catch {
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;