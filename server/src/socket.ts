// Resources
import { Server } from "socket.io";
import { createServer, RequestListener } from "http";
import { debug } from "./lib/Debug";
import { CorsOptions } from "cors";
import { client } from ".";

// Interfaces
interface StoredMessage {
  author: string;
  name: string;
  content: string;
  time: string;
}
interface SessionInfo {
  state: boolean;
  time: string;
}

declare module "http" {
  interface IncomingMessage {
    session?: import("express-session").Session &
      Partial<import("express-session").SessionData> &
      Record<string, unknown>;
  }
}

/**
 * The base initializer for the Socket.io server.
 * @param app The Express application.
 * @param cors The CORS policy options.
 */
export default function Socket(app: RequestListener, cors: CorsOptions) {
  const server = createServer(app);
  const io = new Server(server, {
    cors,
  });

  io.on("connection", async (socket) => {
    const session = socket.request.session; // The session ID received when the user connects to the socket.
    console.log(session);

    // Make sure the session exists, otherwise close connection and return.
    if (!session) {
      socket.disconnect(true);
      return;
    }

    await socket.join(session.id); // Create and join a room by the user's unique session identifier.

    const params = socket.handshake.query;

    if (!params.name || !params.email) {
      socket.disconnect(true);
      return;
    }

    session.name = String(params.name);
    session.email = String(params.email);

    session.save();

    socket.emit("session:created", session.id);

    let data = await client.get(`room:${session.id}:state`);
    if (!data) {
      const newData = JSON.stringify({
        state: true,
        time: new Date(),
      });

      await client.set(`room:${session.id}:state`, newData);
      data = newData;
    }

    const ticket = JSON.parse(data) as SessionInfo;
    socket.emit("server:started", ticket.time);

    const messages = await getRecent();
    debug.success(`Session '${session.id}' has connected to socket.`);

    // Send recent messages.
    messages.forEach((message) => {
      socket.emit("message:receive", {
        initial: true,
        ...message,
      });
    });

    socket.on("message:create", async (message: string) => {
      if (message.length < 3) return;

      const msg: StoredMessage = {
        author: session.id,
        name: session.name as string,
        content: message,
        time: new Date().toISOString(),
      };

      await client.rPush(`room:${session.id}:messages`, JSON.stringify(msg));
      socket.emit("message:receive", msg);
      console.log(msg);
    });

    socket.on("disconnect", async () => {
      await socket.leave(session.id); // Leave the room when the user signals to disconnect from the socket.
      debug.error(`Session '${session.id}' has disconnected from the socket.`);
    });

    async function getRecent(): Promise<
      (Omit<StoredMessage, "time"> & { time: Date })[]
    > {
      if (!session) return [];

      const data = await client.lRange(`room:${session.id}:messages`, -100, -1);
      return data.map((val) => {
        const json = JSON.parse(val) as StoredMessage;
        return {
          author: json.author,
          name: session.name as string,
          content: json.content,
          time: new Date(json.time),
        };
      });
    }
  });

  return { io, server };
}
