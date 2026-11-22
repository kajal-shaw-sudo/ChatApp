// Opens many Socket.io clients, sends messages in a ring, and reports latency.
const { io } = require('socket.io-client');
const fs = require('fs');
const os = require('os');
const path = require('path');

const URL = process.env.LT_URL || 'http://localhost:5001';
const CLIENTS = Number(process.env.LT_CLIENTS || 200);
const MSGS = Number(process.env.LT_MSGS || 20);
const INTERVAL = Number(process.env.LT_INTERVAL_MS || 500);

const { users } = JSON.parse(fs.readFileSync(path.join(os.tmpdir(), 'chatapp-loadtest.json'), 'utf8'));
if (CLIENTS > users.length) {
  console.error(`Only ${users.length} users were seeded; lower LT_CLIENTS or raise LT_USERS.`);
  process.exit(1);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const pct = (arr, p) => {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)];
};
const fmt = arr => arr.length
  ? `p50 ${pct(arr, 50).toFixed(1)} | p95 ${pct(arr, 95).toFixed(1)} | p99 ${pct(arr, 99).toFixed(1)} | max ${Math.max(...arr).toFixed(1)}`
  : 'no data';

const ackLat = [], deliverLat = [], connectLat = [];
let connected = 0, connectErrors = 0, sent = 0, acked = 0, ackErrors = 0;
const sockets = [];

(async () => {
  console.log(`Connecting ${CLIENTS} clients to ${URL}...`);
  for (let i = 0; i < CLIENTS; i++) {
    const t0 = performance.now();
    const socket = io(URL, { transports: ['websocket'], auth: { token: users[i].token }, reconnection: false });
    socket.on('connect', () => { connected++; connectLat.push(performance.now() - t0); });
    socket.on('connect_error', () => { connectErrors++; });
    socket.on('receiveMessage', msg => {
      const m = /^ping:(\d+)$/.exec((msg && msg.content) || '');
      if (m) deliverLat.push(Date.now() - Number(m[1]));
    });
    sockets.push(socket);
    await sleep(10);
  }

  const deadline = Date.now() + 30000;
  while (connected + connectErrors < CLIENTS && Date.now() < deadline) await sleep(100);
  console.log(`Connected: ${connected}/${CLIENTS} (connection errors: ${connectErrors})`);
  await sleep(2000); // let the server finish joining each user's room

  console.log(`Sending ${MSGS} messages per client...`);
  const start = Date.now();
  await Promise.all(sockets.map(async (socket, i) => {
    if (!socket.connected) return;
    const receiverId = users[(i + 1) % CLIENTS].id;
    await sleep(Math.random() * INTERVAL);
    for (let k = 0; k < MSGS; k++) {
      const t0 = performance.now();
      sent++;
      socket.emit('sendMessage', { receiverId, content: `ping:${Date.now()}` }, res => {
        if (res && res.error) { ackErrors++; return; }
        acked++;
        ackLat.push(performance.now() - t0);
      });
      await sleep(INTERVAL);
    }
  }));
  const elapsed = (Date.now() - start) / 1000;
  await sleep(3000); // let in-flight deliveries finish

  console.log('\n===== RESULTS =====');
  console.log(`Clients connected: ${connected}/${CLIENTS}`);
  console.log(`Connect time (ms): ${fmt(connectLat)}`);
  console.log(`Messages sent: ${sent} | acknowledged: ${acked} | ack errors: ${ackErrors} | no ack: ${sent - acked - ackErrors}`);
  console.log(`Throughput: ${(sent / elapsed).toFixed(1)} messages/sec`);
  console.log(`Send->ack latency (ms): ${fmt(ackLat)}`);
  console.log(`Send->delivery latency (ms): ${fmt(deliverLat)} (delivered: ${deliverLat.length})`);

  sockets.forEach(s => s.disconnect());
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });