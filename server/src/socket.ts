// Resources
import { Server } from "socket.io";
import { createServer, RequestListener } from "http";
import { debug } from "./lib/Debug";
import { CorsOptions } from "cors";
import { UserSession } from "./lib/Session";

/**
 * The base initializer for the Socket.io server.
 * @param app The Express application.
 * @param cors The CORS policy options.
 */
export default function Socket(app: RequestListener, cors: CorsOptions) {
  // Server Setup
  const server = createServer(app);
  const io = new Server(server, {
    cors,
  });

  // Namespaces
  const users = io.of("/users");
  const admins = io.of("/admins");

  // Middlewares
  admins.use((_, next) => {
    // TODO: Prevent normal users from connecting to this.
    next();
  });

  /**
   * Administrator connections. Admins can be considered agents or any other type of user that can
   * access any session by passing the above admin middleware.
   * @param socket The connection.
   */
  admins.on("connection", async (socket) => {
    const { room } = socket.handshake.query; // Define query parameters.

    // Make sure room is provided, otherwise disconnect.
    if (!room) {
      socket.disconnect(true);
      return;
    }

    const roomId = String(room);

    // Make sure the provided room actually exists, otherwise disconnect.
    if (!users.adapter.rooms.get(roomId)) {
      socket.disconnect(true);
      return;
    }

    await socket.join(roomId); // Attempt to join provided room.

    socket.on("message:create", (message: string) => {
      console.log(message);
      emit("message:receive", {
        session: "test",
        name: "Agent Test",
        content: message,
        time: new Date().toISOString(),
      });
    });

    /**
     * Simple function to making sending events to the current room easier.
     * @param event The event name.
     * @param args The arguments to add.
     */
    function emit(event: string, ...args: unknown[]) {
      io.of("/users")
        .to(roomId)
        .emit(event, ...args);
    }

    debug.warn(`New admin '${socket.id}' has connected.`);

    socket.on("disconnect", async () => {
      await socket.leave(roomId);
      debug.error(`Admin '${socket.id}' has disconnected.`);
    });
  });

  /**
   * The base user connection, any user that connects from a live chat instance. No type
   * of authentication or middlware needs to be passed to connect.
   * @param socket The connection.
   */
  users.on("connection", async (socket) => {
    try {
      const conn = await UserSession.new(socket); // Create a new user session.
      debug.success(
        `User '${String(conn.session.name)}' has successfully connected.`
      );
      console.log(conn.session.id);

      // Fetch the tickets information and then send ticket start date to client.
      const info = await conn.getSessionInfo();
      socket.emit("server:started", info.time);

      const recent = await conn.getRecentMessages(); // Fetch the previous messages from the chat

      // If the session is new, send them the default message.
      if (recent.length === 0) {
        await conn.sendMessage({
          session: "system_message",
          name: "System",
          content:
            "Thank you for creating a ticket, how may we assist you today?",
          time: new Date().toISOString(),
        });
      }

      // Send recent messages to client
      for (const message of recent) {
        await conn.sendMessage(
          {
            session: message.session,
            name: message.name,
            content: message.content,
            time: message.time.toISOString(),
          },
          true
        );
      }

      /**
       * Listen for when the client signals to create a message.
       */
      socket.on(
        "message:create",
        async (message: string, callback: (error?: string) => void) => {
          try {
            await conn.sendMessage(message);
            callback();
          } catch {
            callback("Internal server error.");
          }
        }
      );

      /**
       * Cleanup the connection when the client disconnects from the socket.
       */
      socket.on("disconnect", async () => {
        await conn.destroy();
        debug.error(`User '${String(conn.session.name)}' has disconnected.`);
      });
    } catch (e) {
      debug.error(String(e));
      socket.disconnect(true);
    }
  });

  return { io, server };
}
