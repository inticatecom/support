// Resources
import { motion, AnimatePresence } from "motion/react";
import moment from "moment";
import { io, Socket } from "socket.io-client";

// Hooks
import { useEffect, useRef, useState, useCallback } from "react";
import useSound from "use-sound";
import useLocalStorage from "./hooks/useLocalStorage";
import { useChatStore } from "./hooks/useChatStore";

// Components
import {
  ChatBox,
  Consent,
  StartSession,
  EmojiMenu,
} from "./components/Interaction";

// Definitions
import { Definitions } from ".";

// Settings
const BACKEND_URL_BASE: string = "http://localhost:3000";
const CONNECTION_TIMEOUT: number = 10;

// Sounds
import SendSound from "./assets/sounds/send.mp3?url";
import ReceiveSound from "./assets/sounds/receive.mp3?url";

// Icons
import { IoChatbox, IoClose } from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";
import { CgSpinner } from "react-icons/cg";

/**
 * The base chat window.
 */
export default function LiveChat({
  visible = true,
}: Definitions.LiveChatProps) {
  const {
    setSessionId,
    sessionId,
    setSessionLoading,
    setAgent,
    setLoading,
    setShowPrompt,
    setMessages,
    setSending,
  } = useChatStore();

  // References
  const socketRef = useRef<Socket>(null);
  const sessionRef = useRef<string>(null);
  const sessionExistsRef = useRef<boolean>(false);

  // Hooks
  const [open, setOpen] = useLocalStorage("live-chat-open", false);
  const [notice, setNotice] = useLocalStorage("live-chat-notice-open", true);
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
        const socket = io(`${BACKEND_URL_BASE}/users`, {
          withCredentials: true,
          query: params,
        });

        socketRef.current = socket; // Assign socket reference the newly created socket instance.

        // Set timeout for connection time.
        const timeout = setTimeout(() => {
          socket.disconnect();
          reject(new Error("Socket connection exceeded timeout length."));
        }, CONNECTION_TIMEOUT * 1000);

        /**
         * Connect listeners and run logic to tell user socket has successfully connected.
         */
        socket.once("connect", () => {
          clearTimeout(timeout);

          /**
           * Triggers when the session connects, allowing the client to receive the session ID.
           */
          socket.once("session:created", (id: string) => {
            setSessionId(id);
            sessionRef.current = id;
          });

          /**
           * Triggers when the chat starts, receiving the time the chat was started at.
           */
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

          /**
           * Triggers when an agent joins the chat.
           */
          socket.on("agent:join", (agent: string) => {
            setAgent(agent);
            addMessage({
              content: `Agent '${agent}' has joined the chat.`,
              time: new Date(),
            });
          });

          /**
           * Triggers when an agent leaves the chat.
           */
          socket.on("agent:leave", (agent: string) => {
            setAgent(null);
            addMessage({
              content: `Agent '${agent}' has left the chat.`,
              time: new Date(),
            });
          });

          /**
           * Triggers when the client receives a server message.
           */
          socket.on("server:message", (message: Definitions.SystemMessage) =>
            addMessage(message)
          );

          /**
           * Triggers when another user in the session sends a message.
           */
          socket.on("message:receive", (message: Definitions.Message) => {
            addMessage(message);
            if (!message.initial && message.session !== sessionRef.current)
              playReceive();
          });

          setShowPrompt(false);
          setLoading(false);

          resolve(true); // Tell the client that the connection between the client and the socket has been successful.
        });

        /**
         * Reject promise and clear timeout if socket refuses to connect.
         */
        socket.once("connect_error", (e) => {
          clearTimeout(timeout);
          console.error(e);

          reject(e);
        });

        /**
         * Clear messages on socket disconnection.
         */
        socket.on("disconnect", () => {
          clearTimeout(timeout);
          setMessages([]);
        });

        /**
         * Adds a message and then sorts by the most recently sent message.
         * @param message The message to append. Either a user or system message.
         */
        function addMessage(message: Definitions.ChatMessage): void {
          /**
           * Combines and sorts the old data and the newly appended value by date.
           * @param previous The current data.
           * @param append The new value.
           * @returns The sorted data.
           */
          function sort(
            previous: Definitions.ChatMessage[],
            append: Definitions.ChatMessage
          ): Definitions.ChatMessage[] {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        await establishConn();
      }
      setSessionLoading(false);
    })();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [establishConn, setSessionLoading]);

  /**
   * Update the session reference whenever the session state changes. We do this to prevent re-rendering
   * for form submissions when the session is changed, but we still need the state to maintain a persistent display
   * to the client's interface.
   */
  useEffect(() => {
    sessionRef.current = sessionId;
  }, [sessionId]);

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
    (e: React.FormEvent<HTMLFormElement>) => Promise<boolean>
  >(
    async (e) => {
      e.preventDefault();

      const form = e.currentTarget;
      return new Promise((resolve) => {
        if (!socketRef.current) {
          resolve(false);
          return;
        }

        setSending(true);
        const entries = new FormData(form);

        socketRef.current.emit(
          "message:create",
          entries.get("message"),
          (error?: string) => {
            setSending(false);

            if (error) {
              resolve(false);
              return;
            }

            form.reset();
            playSend();
            resolve(true);
          }
        );
      });
    },
    [playSend, setSending]
  );

  /**
   * Toggles the chat window's state.
   */
  const toggle = useCallback(() => {
    setOpen(open === "true" ? "false" : "true");
  }, [setOpen, open]);

  return (
    visible && (
      <>
        {open === "true" && (
          <Window
            open={open === "true"}
            setOpen={setOpen}
            showNotice={notice === "true"}
            setNotice={setNotice}
            sendMessage={postMessage}
            startSession={startSession}
          />
        )}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.05 }}
          onClick={toggle}
          className="text-lg font-bold fixed bottom-0 right-0 m-5 cursor-pointer bg-[#121212] border-1 border-white/10 p-4 rounded-full shadow-lg shadow-black/20 hover:scale-[107%] active:scale-90 transition-transform">
          <motion.div
            animate={{
              rotate: open === "true" ? 90 : 0,
              scale: open === "true" ? 1.1 : 1,
            }}
            transition={{
              duration: 0.15,
              ease: "easeInOut",
              stiffness: 200,
            }}
            className="relative">
            <AnimatePresence mode="wait">
              {!(open === "true") ? (
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
  sendMessage,
  startSession,
}: Definitions.WindowProps) {
  // Hooks
  const { loading, sessionLoading, agent, messages, emojisOpen } =
    useChatStore();

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={open ? { scale: 1 } : { scale: 0 }}
      className="flex flex-col fixed right-0 bottom-0 mr-5 mb-22 bg-[#121212] rounded-xl w-[365px] h-[700px] border-1 border-white/10 box-border origin-bottom-right shadow-lg shadow-black/20">
      <div
        className={`border-b-1 border-white/10 flex items-center p-3 ${
          !sessionLoading ? "justify-between" : "justify-end"
        }`}>
        {!sessionLoading && (
          <div className="flex justify-center items-center gap-2">
            <button className="cursor-pointer hover:bg-white/10 p-1 rounded-lg transition-colors">
              <IoIosArrowBack className="text-white/50 text-lg" />
            </button>

            {!loading && (
              <div className="flex justify-center items-center gap-[10px]">
                {agent ? (
                  <motion.span
                    className="w-3 aspect-square bg-green-600 outline-[1px] outline-offset-1 outline-green-700 rounded-full"
                    animate={{
                      outlineWidth: ["4px", "1px"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ) : (
                  <CgSpinner className="text-white animate-spin text-lg" />
                )}
                <h2 className="text-white font-semibold text-[14px]">
                  {agent ? `Connected with ${agent}` : "Waiting for Agent"}
                </h2>
              </div>
            )}
          </div>
        )}
        <button
          className="cursor-pointer hover:bg-white/10 p-1 rounded-lg transition-colors"
          onClick={useCallback(() => {
            setOpen("false");
          }, [setOpen])}>
          <IoClose className="text-white/50 text-xl" />
        </button>
      </div>

      {!sessionLoading ? (
        <div className="relative flex flex-col-reverse gap-3 p-4 grow-[1] overflow-y-auto">
          {messages.length > 0 && (
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
                      content={message.content}
                      time={message.time}
                      mostRecent={index === messages.length - 1}
                      mode={message.local ? "secondary" : "primary"}
                      initial={message.initial}
                    />
                  );
                }
              })}
            </div>
          )}
          {emojisOpen && <EmojiMenu />}
        </div>
      ) : (
        <div className="grow-[1] flex justify-center items-center">
          <CgSpinner className="text-white text-4xl animate-spin" />
        </div>
      )}

      {!sessionLoading && (
        <Form
          showNotice={showNotice}
          setNotice={setNotice}
          sendMessage={sendMessage}
          startSession={startSession}
        />
      )}
    </motion.div>
  );
}

/**
 * The form that allows users to submit a message to the chat.
 */
function Form({
  showNotice,
  setNotice,
  sendMessage,
  startSession,
}: Definitions.FormProps) {
  // Hooks
  const { showPrompt } = useChatStore();

  // States
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

  return (
    <div className="self-end w-full flex flex-col justify-end gap-3 pb-4 px-4">
      {!showPrompt && <ChatBox onSend={sendMessage} />}
      {showPrompt && (
        <StartSession onConnect={connect} connecting={connecting} />
      )}
      {showNotice && <Consent onDismiss={() => setNotice("false")} />}
    </div>
  );
}

/**
 * A message display containing the author, message, and time it was sent at.
 */
function Bubble({
  mode,
  name,
  content,
  time,
  mostRecent,
  initial,
}: Definitions.BubbleProps) {
  return (
    <motion.div
      initial={!initial && { y: 5, opacity: 0 }}
      animate={!initial && { y: 0, opacity: 1 }}
      className={`flex flex-col w-11/12 ${mode === "secondary" && "self-end"}`}>
      <p
        className={`text-white p-3 rounded-lg w-full hyphens-auto break-words whitespace-pre-wrap ${
          !mode || mode === "primary"
            ? "bg-white/10"
            : "bg-blue-500/10 self-end"
        }`}>
        {content}
      </p>
      {mostRecent && (
        <p
          className={`text-[14px] text-white/30 w-full ${
            mode === "secondary" ? "self-end text-right mr-2" : "ml-2"
          }`}>
          {name} • {moment(time).fromNow()}
        </p>
      )}
    </motion.div>
  );
}
