// Resources
import { Server } from "socket.io";
import { createServer, RequestListener } from "http";
import { CorsOptions } from "cors";

// Internal Resources
import { debug } from "./lib/Debug";
import { AdminSession, UserSession } from "./lib/Session";

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
    let conn: AdminSession | null = await AdminSession.new(socket, users); // Initialize the admin session.
    debug.warn(`New admin '${socket.id}' has connected.`);

    /**
     * Listens for message events and send them to the chat.
     */
    socket.on("message:create", async (message: string) => {
      await conn?.sendMessage(message);
    });

    /**
     * Listen for when the client disconnects, then do cleanup.
     */
    socket.on("disconnect", async () => {
      await conn?.destroy();
      debug.error(`Admin '${socket.id}' has disconnected.`);
      conn = null;
    });
  });

  /**
   * The base user connection, any user that connects from a live chat instance. No type
   * of authentication or middlware needs to be passed to connect.
   * @param socket The connection.
   */
  users.on("connection", async (socket) => {
    try {
      let conn: UserSession | null = await UserSession.new(socket); // Create a new user session.
      debug.success(
        `User '${String(conn.session.name)}' has successfully connected.`
      );

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
            await conn?.sendMessage(message);
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
        await conn?.destroy();
        debug.error(`User '${String(conn?.session.name)}' has disconnected.`);
        conn = null;
      });
    } catch (e) {
      debug.error(String(e));
      socket.disconnect(true);
    }
  });

  return { io, server };
}
