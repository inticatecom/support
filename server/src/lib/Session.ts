// Resources
import { Namespace, type Socket } from "socket.io";
import { Session, SessionData } from "express-session";
import { client } from "..";

// Interfaces
interface SessionInfo {
  state: boolean;
  createdAt: string;
  owner: {
    name: string;
    email: string;
  };
}
export interface Message {
  session: string;
  name: string;
  content: string;
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
 * Controls a base user session. Allows you to send messages, system messages, etc.
 */
export class UserSession {
  /** The socket. */
  private readonly socket: Socket;
  /** The current session. */
  public readonly session: Session &
    Partial<SessionData> &
    Record<string, unknown>;
  private owner: string;

  /**
   * Creates a user session.
   * @param socket The socket.
   * @returns The user session controller.
   */
  private constructor(socket: Socket, owner: string) {
    this.socket = socket;

    const session = socket.request.session;
    if (!session) throw new Error("Session does not exist.");

    this.session = session;
    this.owner = owner;
  }

  /**
   * Creates a user session.
   * @param socket The socket.
   * @returns The user session controller.
   */
  static async new(socket: Socket): Promise<UserSession> {
    // Validate the session.
    const session = socket.request.session;
    if (!session) {
      socket.disconnect(true);
      throw new Error("Session does not exist.");
    }

    await socket.join(session.id); // Join the room.
    socket.emit("session:created", session.id); // Tell the client the session ID.

    const conn = new UserSession(socket, ""); // Create the user session.
    let info = await conn.getSessionInfo(); // Fetch the session information.

    // Make sure the name and email are provided if the information does not yet exist.
    const params = socket.handshake.query;
    if (!info && (!params.name || !params.email)) {
      socket.disconnect(true);
      throw new Error(
        "Must provide initial parameters or have previous ones stored."
      );
    }

    // If the information does not exist, create it.
    if (!info) {
      const toSet: SessionInfo = {
        state: true,
        createdAt: new Date().toISOString(),
        owner: params as SessionInfo["owner"],
      };
      await conn.setSessionInfo(toSet);
      info = toSet;
    }

    conn.owner = info.owner.name;
    return conn; // Return class to be used externally.
  }

  /**
   * Sends a message to the current session as the primary session owner.
   * @param message The message to send.
   * @param initial Whether or not this message already exists and you are trying to resend the message to the client.
   */
  public async sendMessage(
    message: string | Message,
    initial?: boolean
  ): Promise<void> {
    let data: Message & { initial?: boolean };
    if (typeof message !== "string" && "session" in message) {
      data = {
        initial: initial,
        ...message,
      };
    } else {
      data = {
        session: this.session.id,
        name: this.owner,
        content: message,
        time: new Date().toISOString(),
        ...(initial && { initial: initial }),
      };
    }

    if (data.content.trim().length < 3) return;

    if (!initial) {
      await client.rPush(
        `room:${this.session.id}:messages`,
        JSON.stringify(data)
      );
    }

    this.socket.emit("message:receive", data);
  }

  /**
   * Runs the cleanup logic to destroy the session and leave the room.
   */
  public async destroy(): Promise<void> {
    await this.socket.leave(this.session.id);
    this.socket.disconnect(true);
  }

  /**
   * Allows you to modify the session information. Any fields not provided will be automatically populated with the current data.
   * @param data The fields to modify.
   */
  public async setSessionInfo(data: Partial<SessionInfo>): Promise<void> {
    const merged = { ...(await this.getSessionInfo()), ...data };
    await client.set(`room:${this.session.id}:state`, JSON.stringify(merged));
  }

  /**
   * Fetches the session information such as its status and owner.
   * @returns The session's information.
   */
  public async getSessionInfo(): Promise<SessionInfo | undefined> {
    const data = await client.get(`room:${this.session.id}:state`);
    return data ? (JSON.parse(data) as SessionInfo) : undefined;
  }

  /**
   * Fetches recent messages in the session.
   * @returns The messages.
   */
  public async getRecentMessages(): Promise<
    (Omit<Message, "time"> & { time: Date })[]
  > {
    const data = await client.lRange(
      `room:${this.session.id}:messages`,
      -100,
      -1
    );
    return data.map((val) => {
      const json = JSON.parse(val) as Message;
      return {
        session: json.session,
        name: json.name,
        content: json.content,
        time: new Date(json.time),
      };
    });
  }
}

/**
 * Creates an admin session and allows you to interact with it.
 */
export class AdminSession {
  /** The socket. */
  private readonly socket: Socket;
  /** The normal user namespace. */
  private readonly namespace: Namespace;
  /** The room identifier. */
  private readonly room: string;

  /**
   * Creates a new instance of an admin session.
   * @param socket The socket.
   * @param userNamespace The normal user namespace.
   * @param room The room to connect to.
   * @returns A new instance of an admin session.
   */
  private constructor(socket: Socket, userNamespace: Namespace, room: string) {
    this.socket = socket;
    this.namespace = userNamespace;
    this.room = room;

    this.emit("agent:join", "Agent Test");
  }

  /**
   * Creates a new instance of an admin session.
   * @param socket The socket.
   * @param userNamespace The normal user namespace.
   * @returns A new instance of an admin session.
   */
  static async new(
    socket: Socket,
    userNamespace: Namespace
  ): Promise<AdminSession> {
    const { room } = socket.handshake.query;
    if (!room) {
      socket.disconnect(true);
      throw new Error("Room was not provided.");
    }

    const roomId = String(room);
    if (!userNamespace.adapter.rooms.get(roomId)) {
      socket.disconnect(true);
      throw new Error("Room does not exist.");
    }

    await socket.join(roomId);

    return new AdminSession(socket, userNamespace, roomId);
  }

  /**
   * Sends a message to the current room.
   * @param message The message to send.
   */
  public async sendMessage(message: string): Promise<void> {
    if (message.trim().length < 3) return;
    const data: Message = {
      session: "agent_message",
      name: "Agent Test",
      content: message,
      time: new Date().toISOString(),
    };

    await client.rPush(`room:${this.room}:messages`, JSON.stringify(data));
    this.emit("message:receive", data);
  }

  /**
   * Cleans up and destroys the admin session.
   */
  public async destroy(): Promise<void> {
    this.emit("agent:leave", "Agent Test");

    await this.socket.leave(this.room);
    this.socket.disconnect(true);
  }

  /**
   * Sends an event with arguments to all clients connected to the room.
   * @param event The name of the event.
   * @param args Any arguments to attach to the event.
   */
  public emit(event: string, ...args: unknown[]): void {
    this.namespace.to(this.room).emit(event, ...args);
  }
}
