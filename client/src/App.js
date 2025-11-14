import React, { useState, useEffect } from "react";
import socket from "./socket";

export default function App() {
  const [code, setCode] = useState("");
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    socket.on("lobbyCreated", (gameCode) => {
      setCode(gameCode);
      alert("Dein Spielcode: " + gameCode);
    });

    socket.on("lobbyJoined", (gameCode) => {
      alert("Du bist beigetreten: " + gameCode);
    });

    socket.on("lobbyError", (msg) => {
      alert(msg);
    });

    return () => {
      socket.off("lobbyCreated");
      socket.off("lobbyJoined");
      socket.off("lobbyError");
    };
  }, []);

  const handleCreate = () => {
    socket.emit("createLobby");
  };

  const handleJoin = () => {
    socket.emit("joinLobby", joinCode);
  };

  return (
    <div>
      <h1>KZU Chess</h1>

      <button onClick={handleCreate}>Spiel erstellen</button>

      <div>
        <input
          placeholder="Spielcode eingeben"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
        />
        <button onClick={handleJoin}>Beitreten</button>
      </div>

      {code && <p>Dein Spielcode: {code}</p>}
    </div>
  );
}
