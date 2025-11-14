import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ---------- DATABASE ----------
sqlite3.verbose();
const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) {
    console.error("❌ DB Error:", err.message);
  } else {
    console.log("✅ SQLite connected");
  }
});

// User table creation
db.run(
  `CREATE TABLE IF NOT EXISTS users (
     id TEXT PRIMARY KEY,
     username TEXT UNIQUE,
     password TEXT
   )`
);

// Game table creation
db.run(
  `CREATE TABLE IF NOT EXISTS games (
     id TEXT PRIMARY KEY,
     playerWhite TEXT,
     playerBlack TEXT,
     fen TEXT
   )`
);

// ---------- AUTH ----------
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: "Hashing failed" });

    const id = uuidv4();
    db.run(
      `INSERT INTO users (id, username, password) VALUES (?, ?, ?)`,
      [id, username, hash],
      (err) => {
        if (err) return res.status(400).json({ error: "Username exists" });
        res.json({ success: true });
      }
    );
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    `SELECT * FROM users WHERE username = ?`,
    [username],
    (err, user) => {
      if (!user) return res.status(400).json({ error: "Invalid credentials" });

      bcrypt.compare(password, user.password, (err, ok) => {
        if (!ok) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
        res.json({ token });
      });
    }
  );
});

// ---------- SOCKET.IO ----------
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("joinGame", ({ gameId }) => {
    socket.join(gameId);
  });

  socket.on("move", ({ gameId, fen }) => {
    io.to(gameId).emit("move", { fen });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ---------- START ----------
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
