// Resources
import { Server } from "socket.io";
import { createServer, RequestListener } from "http";
import { debug } from "./lib/Debug";

export default function Socket(app: RequestListener) {
  const server = createServer(app);
  const io = new Server(server, {
    // path: "/socket",
    cors: {
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    debug.success(
      `A user with the ID '${socket.id}' has connected to the socket.`
    );

    setInterval(() => {
      io.emit("test", "this is a test message.");
    }, 1000);

    socket.on("disconnect", () => {
      debug.error(`User '${socket.id} has disconnected from the socket.`);
    });
  });

  return { io, server };
}
