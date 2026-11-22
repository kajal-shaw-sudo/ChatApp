// Benchmarks the conversation query with and without the compound index.
// Uses a throwaway in-memory MongoDB, so no real data is touched.
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Message = require('../models/Message');

const TOTAL = 200000;      // total messages in the test database
const USERS = 500;         // number of distinct users
const CONVERSATION = 200;  // messages in the conversation we query
const RUNS = 5;

const newId = () => new mongoose.Types.ObjectId();

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

async function seed(userA, userB, users) {
  const now = Date.now();
  const spanMs = 180 * 24 * 60 * 60 * 1000;
  const randomDate = () => new Date(now - Math.random() * spanMs);

  let docs = [];
  for (let i = 0; i < TOTAL - CONVERSATION; i++) {
    const sender = users[Math.floor(Math.random() * USERS)];
    let receiver = users[Math.floor(Math.random() * USERS)];
    if (receiver.equals(sender)) receiver = users[(users.indexOf(sender) + 1) % USERS];
    const d = randomDate();
    docs.push({ sender, receiver, content: 'message ' + i, isRead: false, reactions: [], createdAt: d, updatedAt: d });
    if (docs.length === 10000) {
      await Message.collection.insertMany(docs, { ordered: false });
      docs = [];
    }
  }
  if (docs.length) await Message.collection.insertMany(docs, { ordered: false });

  const conv = [];
  for (let i = 0; i < CONVERSATION; i++) {
    const d = randomDate();
    const fromA = i % 2 === 0;
    conv.push({
      sender: fromA ? userA : userB,
      receiver: fromA ? userB : userA,
      content: 'conversation message ' + i,
      isRead: false, reactions: [], createdAt: d, updatedAt: d
    });
  }
  await Message.collection.insertMany(conv, { ordered: false });
}

async function measure(label, userA, userB, useIndex) {
  const times = [];
  let stats;
  for (let i = 0; i < RUNS + 1; i++) {           // first run is a warm-up
    const q = Message.find({
      $or: [
        { sender: userA, receiver: userB },
        { sender: userB, receiver: userA }
      ]
    }).sort({ createdAt: 1 });
    if (!useIndex) q.hint({ $natural: 1 });      // forces a full collection scan
    const raw = await q.explain('executionStats');
    const ex = Array.isArray(raw) ? raw[0] : raw;
    stats = ex.executionStats;
    if (i > 0) times.push(stats.executionTimeMillis);
  }
  console.log(`\n${label}`);
  console.log('  median executionTimeMillis:', median(times), '(runs:', times.join(', ') + ')');
  console.log('  totalDocsExamined:', stats.totalDocsExamined);
  console.log('  totalKeysExamined:', stats.totalKeysExamined);
  console.log('  nReturned:', stats.nReturned);
}

(async () => {
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await Message.init();                          // builds the compound index

  const users = Array.from({ length: USERS }, newId);
  const userA = users[0];
  const userB = users[1];

  console.log(`Seeding ${TOTAL} messages...`);
  await seed(userA, userB, users);
  console.log('Seeded. Indexes:', JSON.stringify((await Message.collection.indexes()).map(i => i.key)));

  await measure('WITHOUT index (full collection scan)', userA, userB, false);
  await measure('WITH compound index', userA, userB, true);

  await mongoose.disconnect();
  await mongod.stop();
})().catch(err => { console.error(err); process.exit(1); });