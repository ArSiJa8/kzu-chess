import React, { useEffect, useState, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

export default function Game({ socket, gameId, side }) {
const [game, setGame] = useState(new Chess());
const [opponentConnected, setOpponentConnected] = useState(false);
const gameRef = useRef(game);
gameRef.current = game;

useEffect(() => {
socket.on('updatePlayers', (players) => {
setOpponentConnected(players.length === 2);
});
socket.on('move', ({ fen }) => {
const g = new Chess(fen);
setGame(g);
});
return () => {
socket.off('updatePlayers');
socket.off('move');
};
}, [socket]);

function onDrop(sourceSquare, targetSquare) {
const g = new Chess(gameRef.current.fen());
const move = g.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
if (move === null) return false;
setGame(g);
socket.emit('move', { gameId, fen: g.fen(), from: sourceSquare, to: targetSquare, san: move.san });
return true;
}

return (
<div className="game-container">
<h2>Game: {gameId}</h2>
<p>Side: {side || 'Spectator'}</p>
<div className="board">
<Chessboard position={game.fen()} onPieceDrop={(source, target) => onDrop(source, target)} />
</div>
<div className="status">
<p>Opponent connected: {opponentConnected ? 'Yes' : 'No'}</p>
<p>FEN: {game.fen()}</p>
</div>
</div>
);
}
