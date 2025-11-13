import express from "express";
import http from "http";
import { Server } from "socket.io";
import { randomUUID } from "crypto";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const games = {}; // { gameId: { players: [], time: 300, started: false } }

app.post("/create", (req, res) => {
  const { time } = req.body;
  const id = randomUUID().slice(0, 6);
  games[id] = { players: [], time, started: false };
  res.json({ gameId: id });
});

app.post("/join", (req, res) => {
  const { gameId } = req.body;
  if (!games[gameId]) return res.status(404).json({ error: "Game not found" });
  res.json({ success: true });
});

io.on("connection", (socket) => {
  socket.on("joinGame", ({ gameId, username }) => {
    if (!games[gameId]) return;
    const game = games[gameId];

    game.players.push({ id: socket.id, name: username || "Guest" + Math.floor(Math.random() * 1000) });
    socket.join(gameId);

    io.to(gameId).emit("updatePlayers", game.players);

    if (game.players.length === 2) {
      io.to(gameId).emit("readyToStart");
    }
  });

  socket.on("startGame", (gameId) => {
    const game = games[gameId];
    if (!game) return;

    const white = Math.random() < 0.5 ? game.players[0] : game.players[1];
    const black = white === game.players[0] ? game.players[1] : game.players[0];

    game.started = true;
    io.to(gameId).emit("startGame", { white, black, time: game.time });
  });

  socket.on("move", ({ gameId, move }) => {
    io.to(gameId).emit("move", move);
  });

  socket.on("disconnect", () => {
    for (const id in games) {
      const game = games[id];
      game.players = game.players.filter(p => p.id !== socket.id);
      io.to(id).emit("updatePlayers", game.players);
    }
  });
});

server.listen(3001, () => console.log("Server running on port 3001"));
