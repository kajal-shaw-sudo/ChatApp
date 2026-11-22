// Starts the real ChatApp server against a throwaway in-memory MongoDB for load testing.
const fs = require('fs');
const os = require('os');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

const USERS = Number(process.env.LT_USERS || 200);
const SECRET = 'loadtest-secret';

(async () => {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  process.env.JWT_SECRET = SECRET;
  process.env.PORT = '5001';
  process.env.FRONTEND_URL = 'http://localhost:5173';
  process.env.GOOGLE_CLIENT_ID = 'loadtest';
  process.env.GOOGLE_CLIENT_SECRET = 'loadtest';
  process.env.GOOGLE_CALLBACK_URL = 'http://localhost:5001/api/auth/google/callback';

  await mongoose.connect(process.env.MONGO_URI);
  const User = require('../models/User');
  const created = await User.insertMany(
    Array.from({ length: USERS }, (_, i) => ({
      username: 'loaduser' + i,
      email: `loaduser${i}@example.com`,
      password: 'not-a-real-password'
    }))
  );
  const users = created.map(u => ({
    id: String(u._id),
    token: jwt.sign({ userId: u._id, username: u.username }, SECRET, { expiresIn: '1h' })
  }));
  fs.writeFileSync(path.join(os.tmpdir(), 'chatapp-loadtest.json'), JSON.stringify({ users }));
  await mongoose.disconnect();

  console.log(`Seeded ${USERS} users. Starting server on port 5001...`);
  require('../server');
})().catch(err => { console.error(err); process.exit(1); });