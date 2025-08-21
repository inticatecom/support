// Resources
import { Server } from "socket.io";
import { createServer, RequestListener } from "http";
import { debug } from "./lib/Debug";
import { CorsOptions } from "cors";
import { client } from ".";

// Interfaces
interface StoredMessage {
  author: string;
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
    session.test = "this is a test";
    session.save();

    let data = await client.get(`room:${session.id}:state`);
    data ??= await client.set(
      `room:${session.id}:state`,
      JSON.stringify({
        state: true,
        time: new Date(),
      })
    );
    const ticket = JSON.parse(String(data)) as SessionInfo;

    const messages = await getRecent();

    debug.success(`Session '${session.id}' has connected to socket.`);

    // Send recent messages.
    socket.emit("server:started", ticket.time);
    messages.forEach((message) => {
      socket.emit("message:receive", {
        initial: true,
        ...message,
      });
    });

    socket.on("message:create", async (message: string) => {
      const msg = {
        author: session.id,
        content: message,
        time: new Date(),
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
      { author: string; content: string; time: Date }[]
    > {
      if (!session) return [];

      const data = await client.lRange(`room:${session.id}:messages`, -100, -1);
      return data.map((val) => {
        const json = JSON.parse(val) as StoredMessage;
        return {
          author: json.author,
          content: json.content,
          time: new Date(json.time),
        };
      });
    }
  });

  return { io, server };
}
