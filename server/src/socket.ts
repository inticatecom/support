// Resources
import { Server } from "socket.io";
import { createServer, RequestListener } from "http";
import { debug } from "./lib/Debug";
import { CorsOptions } from "cors";

declare module "http" {
  interface IncomingMessage {
    session?: import("express-session").Session &
      Partial<import("express-session").SessionData>;
  }
}

export default function Socket(app: RequestListener, cors: CorsOptions) {
  const server = createServer(app);
  const io = new Server(server, {
    cors: cors,
  });

  io.on("connection", async (socket) => {
    const session = socket.request.session; // The session ID received when the user connects to the socket.

    // Make sure the session exists, otherwise close connection and return.
    if (!session) {
      socket.disconnect(true);
      return;
    }

    await socket.join(session.id); // Create and join a room by the user's unique session identifier.

    debug.success(
      `A user with the ID '${socket.id}' has connected to the socket.`
    );

    // Fixed chat template to test emitting functionality.
    for (let i = 0; i < 10; i++) {
      socket.emit(
        "message:create",
        `This is test message from socket #${String(i + 1)}.`
      );
    }

    socket.on("disconnect", async () => {
      await socket.leave(session.id); // Leave the room when the user signals to disconnect from the socket.
      debug.error(`User '${socket.id} has disconnected from the socket.`);
    });
  });

  return { io, server };
}
