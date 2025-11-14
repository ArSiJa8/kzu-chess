import { io } from "socket.io-client";

const URL = 
  process.env.NODE_ENV === "production"
    ? window.location.origin  // Render deployment
    : "http://localhost:5000"; // local dev

const socket = io(URL, {
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;
