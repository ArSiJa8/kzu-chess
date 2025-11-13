import React, { useState } from 'react';

const SERVER = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

export default function Login({ setToken }) {
const [mode, setMode] = useState('guest');
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');

const register = async () => {
const res = await fetch(`${SERVER}/register`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ username, password })
});
const data = await res.json();
if (data.error) return alert(data.error);
alert('Registered! You can login now.');
};

const login = async () => {
const res = await fetch(`${SERVER}/login`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ username, password })
});
const data = await res.json();
if (data.error) return alert(data.error);
setToken(data.token, data.username);
alert('Logged in as ' + data.username);
};

return (
<div className="login">
<h2>Login / Guest</h2>
<div className="modes">
<button onClick={() => setMode('guest')}>Guest</button>
<button onClick={() => setMode('auth')}>Register / Login</button>
</div>

{mode === 'guest' ? (
<p>Du spielst als Gast (du kannst trotzdem einen Username eingeben, wird aber nicht gespeichert).</p>
) : (
<div className="auth">
<input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
<input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
<div>
<button onClick={register}>Register</button>
<button onClick={login}>Login</button>
</div>
</div>
)}
</div>
);
}
