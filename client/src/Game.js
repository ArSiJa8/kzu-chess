// client/src/Game.js
import React, { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

export default function Game({ socket, gameId, side }) {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());

  useEffect(() => {
    if (!socket) return;

    const onMove = (move) => {
      // server should send SAN/uci or FEN; here expecting FEN
      if (move?.fen) {
        const g = new Chess();
        g.load(move.fen);
        setGame(g);
        setFen(g.fen());
      }
    };

    socket.on("move", onMove);

    return () => {
      socket.off("move", onMove);
    };
  }, [socket]);

  const onDrop = (sourceSquare, targetSquare) => {
    const g = new Chess(game.fen());
    const move = g.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    if (move === null) return false;
    setGame(g);
    setFen(g.fen());
    // notify server
    socket.emit("move", { gameId, fen: g.fen(), move });
    return true;
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Game: {gameId} — You: {side || "spectator"}</h2>
      <Chessboard position={fen} onPieceDrop={(src, dst) => onDrop(src, dst)} />
    </div>
  );
}
