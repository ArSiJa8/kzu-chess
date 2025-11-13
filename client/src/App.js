import React, { useState, useEffect } from 'react';
const [gameId, setGameId] = useState('');
const [joined, setJoined] = useState(false);
const [players, setPlayers] = useState([]);
const [timeMode, setTimeMode] = useState(300);
const [readyToStart, setReadyToStart] = useState(false);
const [gameStarted, setGameStarted] = useState(false);
const [side, setSide] = useState(null);

useEffect(() => {
socket.on('updatePlayers', (list) => setPlayers(list));
socket.on('readyToStart', () => setReadyToStart(true));
socket.on('startGame', ({ white, black, time }) => {
setGameStarted(true);
setSide(white.name === (username || '') ? 'white' : (black.name === (username || '') ? 'black' : null));
alert(`Game started! White: ${white.name}, Black: ${black.name}`);
});
socket.on('errorMsg', (msg) => alert(msg));
return () => {
socket.off('updatePlayers');
socket.off('readyToStart');
socket.off('startGame');
socket.off('errorMsg');
};
}, [username]);

const createGame = async () => {
const res = await fetch(`${SERVER}/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ time: timeMode }) });
const data = await res.json();
setGameId(data.gameId);
};

const joinGame = async () => {
if (!gameId) return alert('Bitte Game Code eingeben');
const res = await fetch(`${SERVER}/join`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gameId }) });
const data = await res.json();
if (data.error) return alert(data.error);
// join via socket
socket.emit('joinGame', { gameId, token, username });
setJoined(true);
};

const startGame = () => {
socket.emit('startGame', gameId);
};

if (gameStarted) {
return <Game socket={socket} gameId={gameId} side={side} />;
}

return (
<div className="container">
<h1>School Chess</h1>
