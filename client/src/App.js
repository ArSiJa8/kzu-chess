// client/src/App.js
import React, { useState, useEffect } from "react";
import Game from "./Game";
import socket from "./socket";

function App() {
  const [gameId, setGameId] = useState("");
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState([]);
  const [timeMode, setTimeMode] = useState(300);
  const [readyToStart, setReadyToStart] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [side, setSide] = useState(null);

  // optional: username stored locally, fallback ''
  const username = localStorage.getItem("username") || "";

  useEffect(() => {
    // defensive: only attach handlers if socket exists
    if (!socket) return;

    const onUpdatePlayers = (list) => setPlayers(list || []);
    const onReadyToStart = () => setReadyToStart(true);
    const onStartGame = ({ white, black, time }) => {
      setGameStarted(true);
      setSide(
        white?.name === username ? "white" : black?.name === username ? "black" : null
      );
      // optionally show modal instead of alert in production
      alert(`Game started!\nWhite: ${white?.name}\nBlack: ${black?.name}\nTime: ${time}s`);
    };

    socket.on("updatePlayers", onUpdatePlayers);
    socket.on("readyToStart", onReadyToStart);
    socket.on("startGame", onStartGame);

    return () => {
      socket.off("updatePlayers", onUpdatePlayers);
      socket.off("readyToStart", onReadyToStart);
      socket.off("startGame", onStartGame);
    };
  }, [username]);

  const joinGame = () => {
    if (!gameId.trim()) return;
    socket.emit("joinGame", { gameId, username });
    setJoined(true);
  };

  const startGame = () => {
    socket.emit("startGame", gameId);
  };

  if (gameStarted) {
    return <Game socket={socket} gameId={gameId} side={side} />;
  }

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, sans-serif" }}>
      <h1>KZU Chess</h1>

      {!joined ? (
        <div>
          <input
            type="text"
            placeholder="Game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            style={{ padding: 8, marginRight: 8 }}
          />
          <input
            type="text"
            placeholder="Your name (optional)"
            defaultValue={username}
            onBlur={(e) => localStorage.setItem("username", e.target.value)}
            style={{ padding: 8, marginRight: 8 }}
          />
          <button onClick={joinGame} style={{ padding: "8px 12px" }}>
            Join Game
          </button>
        </div>
      ) : (
        <div>
          <h3>Players</h3>
          <ul>
            {players.map((p, i) => (
              <li key={i}>{p.name || p.id}</li>
            ))}
          </ul>

          <div style={{ marginTop: 12 }}>
            <label>
              Time (seconds):
              <input
                type="number"
                value={timeMode}
                onChange={(e) => setTimeMode(Number(e.target.value))}
                style={{ width: 100, marginLeft: 8 }}
              />
            </label>
          </div>

          <div style={{ marginTop: 12 }}>
            {readyToStart ? (
              <button onClick={startGame} style={{ padding: "8px 12px" }}>
                Start Game
              </button>
            ) : (
              <div>Waiting for players...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
