// Resources
import { motion, AnimatePresence } from "motion/react";
import moment from "moment";
import { io, Socket } from "socket.io-client";

// Hooks
import { useEffect, useRef, useState, type SetStateAction } from "react";
import useSound from "use-sound";

// Interfaces
// interface ChatProps {
//   /** Your API key that allows the component to interact with the API. */
//   auth: string;
//   /** Any additional options to attach to the chat component. */
//   options?: {
//     /** Whether or not the chat is in debug mode. */
//     debug?: boolean;
//   };
// }
interface BubbleProps {
  /** The color scheme of the chat bubble. */
  mode?: "primary" | "secondary";
  /** The username of the user who sent the message. */
  author: string;
  /** The content of the message. */
  message: string;
  /** The time the message was sent at. */
  time: Date;
  /** Whether or not the message is the most recent one in the list. */
  last?: boolean;
}
interface WindowProps {
  /** Whether or not the window is currently in it's visible state. */
  open: boolean;
  /** The function that allows the visible state to be modified. */
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  /** Whether or not the terms and privacy policy notice should be displayed. */
  showNotice: boolean;
  /** The function that allows the notice state to be modified. */
  setNotice: React.Dispatch<SetStateAction<boolean>>;
  /** Whether or not the window is currently in a loading state. */
  loading: boolean;
  /** The handler for submitting a message to the current session. */
  send: (e: React.FormEvent<HTMLFormElement>) => void;
  /** Whether or not the current user is sending a message. */
  sending: boolean;
  /** The messages that are present in the current session. */
  messages: (Message | SystemMessage)[];
}
interface FormProps {
  /** Whether or not the send form is visible. */
  active: boolean;
  /** Whether or not the notice should be displayed below the form. */
  showNotice: boolean;
  /** The function that allows the notice form state to be modified. */
  setNotice: React.Dispatch<SetStateAction<boolean>>;
  /** The handler for submitting a message to the current session. */
  send: (e: React.FormEvent<HTMLFormElement>) => void;
  /** Whether or not the current user is sending a message. */
  sending: boolean;
  /** Whether or not the user information form should be shown. */
  prompt: boolean;
  /** Whether or not the chat is still in the process of loading it's components. */
  loading: boolean;
}
interface Message {
  /** The author of the message. */
  author: string;
  /** The content of the message (ie. the text that was sent in the message). */
  content: string;
  /** The time the message was sent at. */
  time: Date;
  /** Whether or not the message was sent by the current user. */
  local?: boolean;
  /** Was the message already read in a past session meaning that the message is being loaded from the database, not a new message. */
  initial?: boolean;
}
interface SystemMessage {
  /** The content of the message. */
  content: string;
  /** The time the message was sent at. */
  time: Date;
}

// Sounds
import SendSound from "../assets/sounds/send.mp3?url";
import ReceiveSound from "../assets/sounds/receive.mp3?url";

// Icons
import { IoChatbox, IoClose, IoSend } from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";
import { CgSpinner } from "react-icons/cg";

/**
 * Fetches a specific value from the browser's local storage.
 * @param key The key of the value to find.
 * @param initial The initial value to set if not found.
 * @returns The value of the item.
 */
function getValue(key: string, initial?: unknown): boolean {
  const exists = window.localStorage.getItem(key);

  if (exists !== null) {
    return exists === "true";
  } else {
    window.localStorage.setItem(key, String(initial) || "false");
    return false;
  }
}

/**
 * Sets a local storage value.
 * @param key The key of the value.
 * @param value The value to set.
 */
function setValue(key: string, value: unknown): void {
  window.localStorage.setItem(key, String(value));
}

/**
 * The base chat window.
 */
export default function Chat() {
  // States
  const [open, setOpen] = useState<boolean>(getValue("live-chat-open", false));
  const [loading, setLoading] = useState<boolean>(true);
  const [notice, setNotice] = useState<boolean>(
    getValue("live-chat-notice-open", true)
  );
  const [messages, setMessages] = useState<(Message | SystemMessage)[]>([]);
  const [sending, setSending] = useState<boolean>(false);
  const [session, setSession] = useState<string | null>(null);

  // References
  const socketRef = useRef<Socket>(null);
  const sessionRef = useRef<string>(null);

  // Hooks
  const [playSend] = useSound(SendSound, { volume: 1 });
  const [playReceive] = useSound(ReceiveSound, { volume: 1 });

  useEffect(() => {
    const socket = io("http://localhost:3000", {
      withCredentials: true,
    });
    socketRef.current = socket;

    /**
     * Adds a message and then sorts by the most recently sent message.
     * @param message The message to append. Either a user or system message.
     */
    function addMessage(message: Message | SystemMessage): void {
      /**
       * Combines and sorts the old data and the newly appended value by date.
       * @param previous The current data.
       * @param append The new value.
       * @returns The sorted data.
       */
      function sort(
        previous: (Message | SystemMessage)[],
        append: Message | SystemMessage
      ): (Message | SystemMessage)[] {
        const newMessages = [...previous, append];
        return newMessages.sort((a, b) => a.time.getTime() - b.time.getTime());
      }

      setMessages((prev) => {
        if ("author" in message) {
          // console.log(message.author, session);
          const msg: Message = {
            ...message,
            time: new Date(message.time),
            local: message.author === sessionRef.current,
          };

          return sort(prev, msg);
        } else {
          const systemMsg: SystemMessage = {
            ...message,
            time: new Date(message.time),
          };

          return sort(prev, systemMsg);
        }
      });
    }

    socket.on("connect", () => {
      socket.on("session:created", (id: string) => {
        setSession(id);
        sessionRef.current = id;
      });

      socket.on("server:started", (time: string) => {
        addMessage({
          content: `Chat started at ${new Date(time).toLocaleTimeString(
            undefined,
            {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              hourCycle: "h12",
            }
          )}`,
          time: new Date(time),
        });
      });

      socket.on("server:message", (message: SystemMessage) =>
        addMessage(message)
      );

      socket.on("message:receive", (message: Message) => {
        addMessage(message);
        if (!message.initial && message.author !== sessionRef.current)
          playReceive();
      });

      setLoading(false);
    });

    socket.on("disconnect", () => {
      setMessages([]); // Clear messages on disconnect from session.j
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  /**
   * Triggers when the user submits a message to the chat's form.
   * @param e The form event.
   */
  function sendMsg(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();

    if (!socketRef.current) return;
    setSending(true);

    const data = new FormData(e.currentTarget);
    socketRef.current.emit("message:create", data.get("message"));
    e.currentTarget.reset();
    playSend();
    setSending(false);
  }

  return (
    <>
      {open && (
        <Window
          open={open}
          setOpen={setOpen}
          showNotice={notice}
          setNotice={setNotice}
          loading={loading}
          send={sendMsg}
          sending={sending}
          messages={messages}
        />
      )}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.05 }}
        onClick={() => {
          setOpen(!open);
          setValue("live-chat-open", !open);
        }}
        className="text-lg font-bold fixed bottom-0 right-0 m-5 cursor-pointer bg-[#121212] p-4 rounded-full shadow-lg shadow-black/20 hover:scale-[107%] active:scale-90 transition-transform">
        <motion.div
          animate={{
            rotate: open ? 90 : 0,
            scale: open ? 1.1 : 1,
          }}
          transition={{
            duration: 0.15,
            ease: "easeInOut",
            stiffness: 200,
          }}
          className="relative">
          <AnimatePresence mode="wait">
            {!open ? (
              <motion.span
                key="chatbox"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.05 }}>
                <IoChatbox className="text-white text-2xl" />
              </motion.span>
            ) : (
              <motion.span
                key="close"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.05 }}>
                <IoClose className="text-white text-2xl" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.button>
    </>
  );
}

/**
 * The actual display of the chat and it's messages.
 */
function Window({
  open,
  setOpen,
  showNotice,
  setNotice,
  loading,
  send,
  sending,
  messages,
}: WindowProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={open ? { scale: 1 } : { scale: 0 }}
      className="flex flex-col fixed right-0 bottom-0 mr-5 mb-22 bg-[#121212] rounded-xl w-[365px] h-[700px] border-1 border-white/20 box-border origin-bottom-right shadow-lg shadow-black/20">
      <div className="border-b-[1px] border-white/20 flex justify-between items-center p-3">
        <div className="flex justify-center items-center gap-2">
          <button className="cursor-pointer hover:bg-white/10 p-1 rounded-lg transition-colors">
            <IoIosArrowBack className="text-white/50 text-lg" />
          </button>
          <div className="flex justify-center items-center gap-2">
            {!loading && (
              <img
                src="https://luacode.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ftwobrake.679483fc.jpg&w=2048&q=75"
                className="aspect-square w-5 rounded-lg"
              />
            )}
            <h2 className="text-white font-semibold text-[15px]">
              {!loading ? "John H." : "Loading ..."}
            </h2>
          </div>
        </div>
        <button
          className="cursor-pointer hover:bg-white/10 p-1 rounded-lg transition-colors"
          onClick={() => {
            setOpen(false);
            setValue("live-chat-open", false);
          }}>
          <IoClose className="text-white/50 text-xl" />
        </button>
      </div>

      {!loading ? (
        <div className="flex flex-col-reverse gap-3 p-4 grow-[1] overflow-y-auto">
          <div className="flex flex-col gap-3">
            {messages.map((message, index) => {
              if (!("author" in message)) {
                return (
                  <p
                    key={index}
                    className="text-white/50 self-center text-center text-sm">
                    {message.content}
                  </p>
                );
              } else {
                return (
                  <Bubble
                    key={index}
                    author={message.author}
                    message={message.content}
                    time={message.time}
                    last={index === messages.length - 1}
                    mode={message.local ? "secondary" : "primary"}
                  />
                );
              }
            })}
          </div>
        </div>
      ) : (
        <div className="grow-[1] flex justify-center items-center">
          <CgSpinner className="text-white text-4xl animate-spin" />
        </div>
      )}

      <Form
        active={loading ? false : true}
        showNotice={showNotice}
        setNotice={setNotice}
        send={send}
        sending={sending}
        prompt={false}
        loading={loading}
      />
    </motion.div>
  );
}

/**
 * A message display containing the author, message, and time it was sent at.
 */
function Bubble({ mode, author, message, time, last }: BubbleProps) {
  return (
    <div
      className={`flex flex-col w-11/12 ${mode === "secondary" && "self-end"}`}>
      <p
        className={`text-white p-3 rounded-lg w-full hyphens-auto break-words ${
          !mode || mode === "primary"
            ? "bg-white/10"
            : "bg-blue-500/10 self-end"
        }`}>
        {message}
      </p>
      {last && (
        <p
          className={`text-[14px] text-white/30 w-full ${
            mode === "secondary" ? "self-end text-right mr-2" : "ml-2"
          }`}>
          {author} • {moment(time).fromNow()}
        </p>
      )}
    </div>
  );
}

/**
 * The form that allows users to submit a message to the chat.
 */
function Form({
  active,
  showNotice,
  setNotice,
  send,
  sending,
  prompt,
  loading,
}: FormProps) {
  // States
  const [sendable, setSendable] = useState<boolean>(false);

  return (
    <div className="self-end w-full flex flex-col justify-end gap-3 pb-4 px-4">
      {!prompt && (
        <form
          className={`flex flex-col w-full gap-1 ${!active && "opacity-0"}`}
          onSubmit={send}>
          <label className="rounded-xl bg-white/10 text-white p-3 w-full outline-offset-[2.7px] outline-white/30 focus-within:outline-[2.5] flex justify-between items-center gap-4 cursor-text has-[:disabled]:text-white/50">
            <input
              className="outline-none w-full disabled:cursor-not-allowed"
              type="text"
              placeholder="Ask a question ..."
              disabled={sending && sendable}
              name="message"
              onChange={(e) => {
                if (e.target.value.length >= 3) {
                  setSendable(true);
                } else {
                  setSendable(false);
                }
              }}
            />
            <button
              type="submit"
              className={sendable ? "cursor-pointer" : "cursor-not-allowed"}
              disabled={!sendable}>
              {!sending ? (
                <IoSend className={sendable ? "text-white" : "text-white/30"} />
              ) : (
                <CgSpinner className="text-white text-lg animate-spin cursor-not-allowed" />
              )}
            </button>
          </label>
        </form>
      )}

      {prompt && (
        <form className="flex flex-col rounded-xl p-4 gap-2 bg-white/10">
          <label className="flex flex-col gap-1 text-white">
            Full Name
            <input
              type="text"
              placeholder="Please enter your full name"
              className="bg-white/10 p-2 text-white rounded-lg outline-white focus:outline-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-white">
            Email
            <input
              type="email"
              placeholder="Please enter your email address"
              className="bg-white/10 p-2 text-white rounded-lg outline-white focus:outline-2"
            />
          </label>
          <button
            type="submit"
            className="w-full bg-white rounded-lg p-2 text-sm text-black font-semibold cursor-pointer">
            Start Conversation
          </button>
        </form>
      )}

      {!loading && showNotice && (
        <div className="flex justify-center items-center gap-2 bg-white/10 rounded-xl p-3">
          <p className="text-white/50 text-sm">
            By continuing to use our services, you agree to our terms of privacy
            policy.
          </p>
          <button
            type="button"
            onClick={() => {
              setNotice(false);
              setValue("live-chat-notice-open", false);
            }}
            className="cursor-pointer hover:bg-white/10 p-1 rounded-lg transition-colors">
            <IoClose className="text-white text-xl" />
          </button>
        </div>
      )}
    </div>
  );
}
