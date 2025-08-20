// Resources
import { useEffect, useRef, useState, type SetStateAction } from "react";
import { motion, AnimatePresence } from "motion/react";
import moment from "moment";
import { io, Socket } from "socket.io-client";

// Interfaces
interface ChatProps {
  /** Your API key that allows the component to interact with the API. */
  auth: string;
  /** Any additional options to attach to the chat component. */
  options?: {
    /** Whether or not the chat is in debug mode. */
    debug?: boolean;
  };
}
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
  loading?: boolean;
  send: (e: React.FormEvent<HTMLFormElement>) => void;
  sending: boolean;
  messages: Message[];
}
interface FormProps {
  /** Whether or not the send form is visible. */
  active: boolean;
  /** Whether or not the notice should be displayed below the form. */
  showNotice: boolean;
  /** The function that allows the notice form state to be modified. */
  setNotice: React.Dispatch<SetStateAction<boolean>>;
  send: (e: React.FormEvent<HTMLFormElement>) => void;
  sending: boolean;
}
interface Message {
  author: string;
  content: string;
  time: Date;
  local?: boolean;
}

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | undefined>(undefined);

  // Hooks
  useEffect(() => {
    const socket = io("http://localhost:3000", {
      withCredentials: true,
    });

    socket.on("connect", () => {
      socket.on("message:receive", (message: Message) => {
        setMessages((prev) => {
          const messageWithDate = {
            ...message,
            time: new Date(message.time),
            local: message.author === socket.id,
          };

          const newMessages = [...prev, messageWithDate];
          return newMessages.sort(
            (a, b) => a.time.getTime() - b.time.getTime()
          );
        });
      });
    });

    setSocket(socket);
    return () => {
      socket.disconnect();
    };
  }, []);

  // References
  const timer = useRef<NodeJS.Timeout>(null);

  // Hooks
  useEffect(() => {
    if (!open) {
      if (timer.current) {
        clearTimeout(timer.current);
      }

      setLoading(true);
      return;
    }

    timer.current = setTimeout(() => setLoading(false), 500);
  }, [open]);

  function sendMsg(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();

    if (!socket) return;

    setSending(true);

    const data = new FormData(e.currentTarget);
    socket.emit("message:create", data.get("message"));
    e.currentTarget.reset();
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
      <button
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
      </button>
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
      className="fixed right-0 bottom-0 mr-5 mb-22 bg-[#121212] rounded-xl w-[365px] border-1 border-white/20 box-border origin-bottom-right shadow-lg shadow-black/20">
      <div className="border-b-[1px] border-white/20 flex justify-between items-center p-3">
        <div className="flex justify-center items-center gap-2">
          <button className="cursor-pointer hover:bg-white/10 p-1 rounded-lg transition-colors">
            <IoIosArrowBack className="text-white/50 text-lg" />
          </button>
          <div className="flex justify-center items-center gap-2">
            <img
              src="https://luacode.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ftwobrake.679483fc.jpg&w=2048&q=75"
              className="aspect-square w-5 rounded-lg"
            />
            <h2 className="text-white font-semibold text-[15px]">John H.</h2>
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
        <div className="flex flex-col-reverse gap-3 p-4 h-[570px] overflow-y-auto">
          <div className="flex flex-col gap-3">
            <p className="text-white/50 self-center text-center text-sm">
              Chat started at 5:00PM
            </p>
            {messages.map((message, index) => (
              <Bubble
                key={index}
                author={message.author}
                message={message.content}
                time={message.time}
                last={index === messages.length - 1}
                mode={message.local ? "secondary" : "primary"}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="h-96 flex justify-center items-center">
          <CgSpinner className="text-white text-4xl animate-spin" />
        </div>
      )}

      <Form
        active={loading ? false : true}
        showNotice={showNotice}
        setNotice={setNotice}
        send={send}
        sending={sending}
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
        className={`text-white p-4 rounded-lg w-full hyphens-auto break-words ${
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
function Form({ active, showNotice, setNotice, send, sending }: FormProps) {
  // States
  const [sendable, setSendable] = useState<boolean>(false);

  return (
    <form
      className={`mx-4 mb-4 mt-2 flex flex-col gap-1 ${!active && "opacity-0"}`}
      onSubmit={send}>
      <div className="rounded-xl bg-white/10 text-white p-3 w-full outline-offset-[2.7px] outline-white/30 ring-white/30 focus-within:outline-[2.5] flex justify-between items-center gap-4 has-[:disabled]:text-white/50">
        <input
          className="outline-none w-full disabled:cursor-not-allowed"
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
      </div>
      {showNotice && (
        <div className="flex justify-center items-center gap-2 bg-white/10 rounded-xl p-3 mt-2">
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
    </form>
  );
}
