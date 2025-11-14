// client/src/socket.js
import { io } from "socket.io-client";

const URL =
  process.env.NODE_ENV === "production"
    ? window.location.origin
    : "http://localhost:5000";

const socket = io(URL, {
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;
