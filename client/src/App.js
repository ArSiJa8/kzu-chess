import React, { useState, useEffect } from 'react';
import Game from './Game';
import socket from './socket';

function App() {
  const [gameId, setGameId] = useState('');
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState([]);
  const [timeMode, setTimeMode] = useState(300);
  const [readyToStart, setReadyToStart] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [side, setSide] = useState(null);

  const username = localStorage.getItem('username') || '';

  useEffect(() => {
    socket.on('updatePlayers', (list) => setPlayers(list));
    socket.on('readyToStart', () => setReadyToStart(true));

    socket.on('startGame', ({ white, black, time }) => {
      setGameStarted(true);

      setSide(
        white.name === username
          ? 'white'
          : black.name === username
          ? 'black'
          : null
      );

      alert(
        `Game started!\nWhite: ${white.name}\nBlack: ${black.name}\nTime: ${time}s`
      );
    });

    return () => {
      socket.off('updatePlayers');
      socket.off('readyToStart');
      socket.off('startGame');
    };
  }, [username]);

  const joinGame = () => {
    if (!gameId.trim()) return;
    socket.emit('joinGame', { gameId, username });
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
      <h1>KZU Chess</h1>

      {!joined ? (
        <div>
          <input
            type="text"
            placeholder="Game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
          />
          <button onClick={joinGame}>Join Game</button>
        </div>
      ) : (
        <div>
          <h3>Players:</h3>
          <ul>
            {players.map((p, i) => (
              <li key={i}>{p.name}</li>
            ))}
          </ul>

          {readyToStart && (
            <button onClick={startGame}>Start Game</button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
