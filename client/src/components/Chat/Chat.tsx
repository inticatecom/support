// Resources
import { motion, AnimatePresence } from "motion/react";
import moment from "moment";
import { io, Socket } from "socket.io-client";

// Hooks
import { useEffect, useRef, useState, useCallback } from "react";
import useSound from "use-sound";

// Definitions
import { Definitions } from ".";
type ChatMessage = Definitions.Message | Definitions.SystemMessage;

// Settings
const BACKEND_URL_BASE: string = "http://localhost:3000";
const CONNECTION_TIMEOUT: number = 10;

// Sounds
import SendSound from "./assets/sounds/send.mp3?url";
import ReceiveSound from "./assets/sounds/receive.mp3?url";

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
function getValue(key: string, initial: string): string {
  const exists = window.localStorage.getItem(key);

  if (exists !== null) {
    return exists;
  } else {
    window.localStorage.setItem(key, String(initial));
    return String(initial);
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
export default function Chat({ visible = true }: Definitions.ChatProps) {
  // States
  const [open, setOpen] = useState<boolean>(
    Boolean(getValue("live-chat-open", "false"))
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [notice, setNotice] = useState<boolean>(
    Boolean(getValue("live-chat-notice-open", "true"))
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState<boolean>(false);
  const [session, setSession] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(true);

  // References
  const socketRef = useRef<Socket>(null);
  const sessionRef = useRef<string>(null);
  const sessionExistsRef = useRef<boolean>(false);

  // Hooks
  const [playSend] = useSound(SendSound, { volume: 1 });
  const [playReceive] = useSound(ReceiveSound, { volume: 1 });

  /**
   * Establish's a connection between the client and backend socket.
   * @param params The query parameters to attach to the socket initially. Params do not need to be attached if the session already exists.
   * @returns A promise resolving the request when the client connects to the socket.
   */
  const establishConn = useCallback<
    (params?: Record<string, unknown>) => Promise<boolean>
  >(
    async (params) => {
      return new Promise((resolve, reject) => {
        if (socketRef.current) socketRef.current.disconnect(); // If the socket already exists, disconnect it to allow for a new connection.

        // Make sure that if the params do not exist, the session exists, otherwise bail out early.
        if (!params && !sessionExistsRef.current) {
          resolve(false);
          return;
        }

        // Create Socket.io client.
        const socket = io(BACKEND_URL_BASE, {
          withCredentials: true,
          query: params,
        });

        socketRef.current = socket; // Assign socket reference the newly created socket instance.

        // Set timeout for connection time.
        const timeout = setTimeout(() => {
          socket.disconnect();
          reject(new Error("Socket connection exceeded timeout length."));
        }, CONNECTION_TIMEOUT * 1000);

        // Connect listeners and run logic to tell user socket has successfully connected.
        socket.once("connect", () => {
          clearTimeout(timeout);

          socket.once("session:created", (id: string) => {
            setSession(id);
            sessionRef.current = id;
          });

          socket.once("server:started", (time: string) => {
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

          socket.on("server:message", (message: Definitions.SystemMessage) =>
            addMessage(message)
          );

          socket.on("message:receive", (message: Definitions.Message) => {
            addMessage(message);
            if (!message.initial && message.session !== sessionRef.current)
              playReceive();
          });

          setShowPrompt(false);
          setLoading(false);

          resolve(true); // Tell the client that the connection between the client and the socket has been successful.
        });

        // Reject promise and clear timeout if socket refuses to connect.
        socket.once("connect_error", (e) => {
          clearTimeout(timeout);
          console.error(e);

          reject(e);
        });

        // Clear messages on socket disconnection.
        socket.once("disconnect", () => {
          clearTimeout(timeout);
          setMessages([]);
        });

        /**
         * Adds a message and then sorts by the most recently sent message.
         * @param message The message to append. Either a user or system message.
         */
        function addMessage(message: ChatMessage): void {
          /**
           * Combines and sorts the old data and the newly appended value by date.
           * @param previous The current data.
           * @param append The new value.
           * @returns The sorted data.
           */
          function sort(
            previous: ChatMessage[],
            append: ChatMessage
          ): ChatMessage[] {
            const newMessages = [...previous, append];
            return newMessages.sort(
              (a, b) => a.time.getTime() - b.time.getTime()
            );
          }

          setMessages((prev) => {
            if ("session" in message) {
              const msg: Definitions.Message = {
                ...message,
                session: message.session,
                time: new Date(message.time),
                local: message.session === sessionRef.current,
              };

              return sort(prev, msg);
            } else {
              const systemMsg: Definitions.SystemMessage = {
                ...message,
                time: new Date(message.time),
              };

              return sort(prev, systemMsg);
            }
          });
        }
      });
    },
    [playReceive]
  );

  /**
   * Make an initial request to the backend route that lets the client know if there is already a session present.
   * We can only do this on the backend as the cookie used to stored the session makes use of the HTTP-only attribute
   * making it unaccessible by JavaScript on the client.
   */
  useEffect(() => {
    (async () => {
      const exists = await (
        await fetch(`${BACKEND_URL_BASE}/status/session`, {
          credentials: "include",
        })
      ).text();
      sessionExistsRef.current = exists === "true";
      if (exists === "true") {
        establishConn();
      }
    })();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [establishConn]);

  /**
   * Update the session reference whenever the session state changes. We do this to prevent re-rendering
   * for form submissions when the session is changed, but we still need the state to maintain a persistent display
   * to the client's interface.
   */
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  /**
   * The event for when the client submits the details form which will then initiate the session by connecting to the socket in the backend.
   * @param e The form event.
   * @returns A boolean representing whether or not the operation succeeded.
   */
  const startSession = useCallback<
    (e: React.FormEvent<HTMLFormElement>) => Promise<boolean>
  >(
    async (e) => {
      e.preventDefault();

      const entries = new FormData(e.currentTarget);
      return await establishConn({
        name: entries.get("name"),
        email: entries.get("email"),
      });
    },
    [establishConn]
  );

  /**
   * The event for when the client sends a message to the active session.
   * @param e The form event.
   */
  const postMessage = useCallback<
    (e: React.FormEvent<HTMLFormElement>) => void
  >(
    (e) => {
      e.preventDefault();

      if (!socketRef.current) return;
      setSending(true);

      const entries = new FormData(e.currentTarget);

      socketRef.current.emit("message:create", entries.get("message"));
      e.currentTarget.reset();

      playSend();
      setSending(false);
    },
    [playSend]
  );

  return (
    visible && (
      <>
        {open && (
          <Window
            open={open}
            setOpen={setOpen}
            showNotice={notice}
            setNotice={setNotice}
            loading={loading}
            sendMessage={postMessage}
            sending={sending}
            messages={messages}
            startSession={startSession}
            prompt={showPrompt}
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
    )
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
  sendMessage,
  sending,
  messages,
  startSession,
  prompt,
}: Definitions.WindowProps) {
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
              <CgSpinner className="text-white animate-spin text-lg" />
            )}
            <h2 className="text-white font-semibold text-[14px]">
              {!loading ? "Waiting for Agent" : "Live Chat"}
            </h2>
          </div>
        </div>
        <button
          className="cursor-pointer hover:bg-white/10 p-1 rounded-lg transition-colors"
          onClick={useCallback(() => {
            setOpen(false);
            setValue("live-chat-open", false);
          }, [setOpen])}>
          <IoClose className="text-white/50 text-xl" />
        </button>
      </div>

      {!loading ? (
        <div className="flex flex-col-reverse gap-3 p-4 grow-[1] overflow-y-auto">
          <div className="flex flex-col gap-3">
            {messages.map((message, index) => {
              if (!("session" in message)) {
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
                    session={message.session}
                    name={message.name}
                    message={message.content}
                    time={message.time}
                    mostRecent={index === messages.length - 1}
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
        sendMessage={sendMessage}
        sending={sending}
        prompt={prompt}
        startSession={startSession}
      />
    </motion.div>
  );
}

/**
 * The form that allows users to submit a message to the chat.
 */
function Form({
  active,
  showNotice,
  setNotice,
  sendMessage,
  sending,
  prompt,
  startSession,
}: Definitions.FormProps) {
  // States
  const [sendable, setSendable] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);

  /**
   * The event for when the client triggers the session to be started.
   * @param e The form event.
   */
  const connect = useCallback<(e: React.FormEvent<HTMLFormElement>) => void>(
    async (e) => {
      setConnecting(true);
      try {
        await startSession(e);
      } catch (e) {
        console.error(e);
      } finally {
        setConnecting(false);
      }
    },
    [startSession]
  );

  /**
   * The event for when the client enters or removes text from the message input.
   * @param e The form event.
   */
  const onMessageChange = useCallback<
    (e: React.ChangeEvent<HTMLInputElement>) => void
  >((e) => {
    setSendable(e.target.value.length >= 3);
  }, []);

  /**
   * Triggers when the user submits the send message form.
   * @param e The form event.
   */
  const send = useCallback<(e: React.FormEvent<HTMLFormElement>) => void>(
    (e) => {
      sendMessage(e);
      setSendable(false);
    },
    [sendMessage]
  );

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
              onChange={onMessageChange}
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
        <form
          className="flex flex-col rounded-xl p-4 gap-2 bg-white/2 border-1 border-white/10"
          onSubmit={connect}>
          <label className="flex flex-col gap-1 text-white">
            Full Name
            <input
              type="text"
              name="name"
              placeholder="Please enter your full name"
              disabled={connecting}
              required
              className="bg-white/5 p-2 text-white rounded-lg outline-white disabled:cursor-not-allowed focus:outline-2 border-1 border-white/10"
            />
          </label>
          <label className="flex flex-col gap-1 text-white">
            Email
            <input
              type="email"
              name="email"
              placeholder="Please enter your email address"
              disabled={connecting}
              required
              className="bg-white/5 p-2 text-white rounded-lg outline-white disabled:cursor-not-allowed focus:outline-2 border-1 border-white/10"
            />
          </label>
          <button
            type="submit"
            className="flex justify-center items-center w-full bg-white rounded-lg p-2 text-sm text-black font-semibold cursor-pointer hover:bg-white/95 transition-colors">
            {!connecting ? (
              "Start Conversation"
            ) : (
              <CgSpinner className="text-black animate-spin text-[20px]" />
            )}
          </button>
        </form>
      )}

      {showNotice && (
        <div className="flex justify-center items-center gap-2 bg-white/10 rounded-xl p-3">
          <p className="text-white/50 text-sm">
            By continuing to use our services, you agree to our{" "}
            <a
              href="https://inticate.com/terms"
              target="_blank"
              className="underline hover:text-blue-500">
              terms
            </a>{" "}
            and{" "}
            <a
              href="https://inticate.com/privacy"
              target="_blank"
              className="underline hover:text-blue-500">
              privacy policy
            </a>
            .
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

/**
 * A message display containing the author, message, and time it was sent at.
 */
function Bubble({
  mode,
  name,
  message,
  time,
  mostRecent,
}: Definitions.BubbleProps) {
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
      {mostRecent && (
        <p
          className={`text-[14px] text-white/30 w-full ${
            mode === "secondary" ? "self-end text-right mr-2" : "ml-2"
          }`}>
          {name} • {moment(time).fromNow()}
        </p>
      )}
    </div>
  );
}
