Server ist ein Node.js Express Server mit Socket.IO.

Endpoints:
- POST /register { username, password }
- POST /login { username, password } -> { token, username }
- POST /create { time } -> { gameId }
- POST /join { gameId } -> { success }

Socket events:
- joinGame: { gameId, token?, username? }
- startGame: gameId
- move: { gameId, fen, from, to, san }
- updatePlayers (server -> clients)
- startGame (server -> clients) -> { white, black, time }
