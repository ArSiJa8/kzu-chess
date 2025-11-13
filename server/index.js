import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

let db;
(async () => {
  db = await open({ filename: './db.sqlite', driver: sqlite3.Database });
  await db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT
  )`);
  await db.exec(`CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    time_mode INTEGER,
    created_at TEXT
  )`);
})();

// In-memory games state for realtime
const games = {};

// --- Auth routes ---
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const hashed = await bcrypt.hash(password, 10);
  try {
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', username, hashed);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: 'Username taken' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const row = await db.get('SELECT * FROM users WHERE username = ?', username);
  if (!row) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, row.password);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: row.id, username: row.username }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, username: row.username });
});

// --- Game routes ---
app.post('/create', (req, res) => {
  const { time } = req.body;
  const id = uuidv4().slice(0, 6);
  games[id] = { players: [], time: Number(time) || 0, started: false };
  res.json({ gameId: id });
});

app.post('/join', (req, res) => {
  const { gameId } = req.body;
  if (!games[gameId]) return res.status(404).json({ error: 'Game not found' });
  res.json({ success: true });
});

// --- Socket.IO for real-time updates ---
io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  socket.on('joinGame', ({ gameId, username }) => {
    if (!games[gameId]) return;
    if (!games[gameId].players.includes(username)) games[gameId].players.push(username);
    socket.join(gameId);
    io.to(gameId).emit('updatePlayers', games[gameId].players);
  });

  socket.on('move', ({ gameId, fen }) => {
    io.to(gameId).emit('move', { fen });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

// --- Start server ---
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
