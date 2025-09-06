// Resources
import { type SetStorage } from "./hooks/useLocalStorage";

/** A type to define the parameters and return type for a form event.  */
type FormEvent<Return> = (e: React.FormEvent<HTMLFormElement>) => Return;

/** Properties to be attached to the main live chat component. */
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

/** Properties to be attached to the main window. */
export interface WindowProps {
  /** Whether or not the window is currently in it's visible state. */
  open: boolean;
  /** The function that allows the visible state to be modified. */
  setOpen: SetStorage;
  /** Whether or not the terms and privacy policy notice should be displayed. */
  showNotice: boolean;
  /** The function that allows the notice state to be modified. */
  setNotice: SetStorage;
  /** The handler for submitting a message to the current session. */
  sendMessage: FormEvent<Promise<boolean>>;
  /** The event that triggers when the socket will attempt a connection. */
  startSession: FormEvent<Promise<boolean>>;
}

/** Properties to be attached to the chat box. */
export type FormProps = Omit<
  WindowProps,
  "open" | "setOpen" | "messages" | "chatLoading" | "sessionLoading" | "agent"
>;

/** Properties to be attached to a message displayed in the main component. */
export interface BubbleProps
  extends Pick<Message, "session" | "name" | "time"> {
  /** The color scheme of the chat bubble. */
  mode?: "primary" | "secondary";
  /** The content of the message. */
  message: string;
  /** Whether or not the message is the most recent one in the list. */
  mostRecent?: boolean;
}

/** The contents of a message retrieved from the backend. */
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

/** Represents a message sent by the system rather than a normal user. */
export type SystemMessage = Pick<Message, "content" | "time">;

/** A base chat message, basically combines normal messages and system messages into a single type. */
export type ChatMessage = Message | SystemMessage;

/** Properties attached to the chat input box. */
export interface ChatBoxProps {
  /** The event that is triggered when the user successfully submits a message to the chat box. */
  onSend: FormEvent<Promise<boolean>>;
}

/** Properties attached to the start session form if no session is active. */
export interface StartSessionProps {
  /** The function to run when the user submits their initial session details. */
  onConnect: FormEvent<void>;
  /** Whether or not the user is currently in the process of connecting to a session. Basically a loading state for the form. */
  connecting: boolean;
}

/** Properties attached to the terms and privacy policies form. */
export interface ConsentProps {
  /** The function to run when the user dismissed the consent notice. */
  onDismiss: () => void;
}
