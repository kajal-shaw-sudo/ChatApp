const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'chatapp-profiles', allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'], transformation: [{ width: 500, height: 500, crop: 'limit' }] }
});

const fileStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'chatapp-files', resource_type: 'auto' }
});

const uploadProfile = multer({ storage: profileStorage, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadFile = multer({ storage: fileStorage, limits: { fileSize: 10 * 1024 * 1024 } });

module.exports = { cloudinary, uploadProfile, uploadFile };