import { useState, useEffect } from "react";
import io from "socket.io-client";
const socket = io("http://localhost:3001");

function App() {
  const [gameId, setGameId] = useState("");
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState([]);
  const [ready, setReady] = useState(false);

  const [username, setUsername] = useState("");
  const [time, setTime] = useState(300);

  const createGame = async () => {
    const res = await fetch("http://localhost:3001/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time }),
    });
    const data = await res.json();
    setGameId(data.gameId);
  };

  const joinGame = () => {
    socket.emit("joinGame", { gameId, username });
    setJoined(true);
  };

  useEffect(() => {
    socket.on("updatePlayers", (list) => setPlayers(list));
    socket.on("readyToStart", () => setReady(true));
    socket.on("startGame", (info) => alert(`White: ${info.white.name}, Black: ${info.black.name}`));
  }, []);

  return (
    <div>
      {!joined ? (
        <div>
          <h1>🎯 Chess Lobby</h1>
          <input placeholder="Username (optional)" onChange={e => setUsername(e.target.value)} />
          <select onChange={e => setTime(Number(e.target.value))}>
            <option value="300">5 Minuten</option>
            <option value="600">10 Minuten</option>
            <option value="1200">20 Minuten</option>
            <option value="0">Unendlich</option>
          </select>
          <button onClick={createGame}>Create Game</button>
          <input placeholder="Game Code" onChange={e => setGameId(e.target.value)} />
          <button onClick={joinGame}>Join Game</button>
        </div>
      ) : (
        <div>
          <h2>Game Code: {gameId}</h2>
          <p>Players: {players.map(p => p.name).join(", ")}</p>
          {ready && <button onClick={() => socket.emit("startGame", gameId)}>Start Game</button>}
        </div>
      )}
    </div>
  );
}

export default App;
