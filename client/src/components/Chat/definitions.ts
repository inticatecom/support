// Resources
import { type SetStorage } from "./hooks/useLocalStorage";

type ConnectEvent = (e: React.FormEvent<HTMLFormElement>) => Promise<boolean>;

type SendEvent = (e: React.FormEvent<HTMLFormElement>) => Promise<boolean>;

export type SystemMessage = Pick<Message, "content" | "time">;

export interface LiveChatProps {
  /** Your API key that allows the component to interact with the API. */
  auth: string;
  /** Whether or not the chat interface is shown at all. Keep in mind that the socket connection will still connect in the background. */
  visible?: boolean;
  /** Any additional options to attach to the chat component. */
  options?: {
    /** Whether or not the chat is in debug mode. */
    debug?: boolean;
  };
}

export interface BubbleProps
  extends Pick<Message, "session" | "name" | "time"> {
  /** The color scheme of the chat bubble. */
  mode?: "primary" | "secondary";
  /** The content of the message. */
  message: string;
  /** Whether or not the message is the most recent one in the list. */
  mostRecent?: boolean;
}

export interface WindowProps {
  /** Whether or not the window is currently in it's visible state. */
  open: boolean;
  /** The function that allows the visible state to be modified. */
  setOpen: SetStorage;
  /** Whether or not the terms and privacy policy notice should be displayed. */
  showNotice: boolean;
  /** The function that allows the notice state to be modified. */
  setNotice: SetStorage;
  /** Whether or not the window is currently in a loading state. */
  chatLoading: boolean;
  sessionLoading: boolean;
  /** The handler for submitting a message to the current session. */
  sendMessage: SendEvent;
  /** Whether or not the current user is sending a message. */
  sending: boolean;
  /** The messages that are present in the current session. */
  messages: (Message | SystemMessage)[];
  /** Whether or not the initial session details form is shown. */
  prompt: boolean;
  /** The event that triggers when the socket will attempt a connection. */
  startSession: ConnectEvent;
  agent: string | null;
}

export type FormProps = Omit<
  WindowProps,
  "open" | "setOpen" | "messages" | "chatLoading" | "sessionLoading" | "agent"
>;

export interface Message {
  /** The session ID from which the message was sent from. */
  session: string;
  /** The display name of the user who sent the message. */
  name: string;
  /** The content of the message (ie. the text that was sent in the message). */
  content: string;
  /** The time the message was sent at. */
  time: Date;
  /** Whether or not the message was sent by the current user. */
  local?: boolean;
  /** Was the message already read in a past session meaning that the message is being loaded from the database, not a new message. */
  initial?: boolean;
}
