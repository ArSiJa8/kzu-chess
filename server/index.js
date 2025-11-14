const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Utility: Random Game Code
function generateGameCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Create Lobby
  socket.on("createLobby", () => {
    const code = generateGameCode();
    socket.join(code);
    socket.emit("lobbyCreated", code);
    console.log(`Lobby created: ${code}`);
  });

  // Join Lobby
  socket.on("joinLobby", (code) => {
    const rooms = io.sockets.adapter.rooms;

    if (!rooms.has(code)) {
      socket.emit("lobbyError", "Lobby existiert nicht.");
      return;
    }

    socket.join(code);
    socket.emit("lobbyJoined", code);
    io.to(code).emit("playerJoined", socket.id);
    console.log(`Player joined lobby: ${code}`);
  });
});

app.get("/", (req, res) => {
  res.send("KZU Chess server running");
});

server.listen(3001, () => {
  console.log("Server listening on port 3001");
});
