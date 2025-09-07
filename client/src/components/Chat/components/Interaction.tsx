// Resources
import Gif from "../assets/images/gif.svg";
import { motion } from "motion/react";

// Hooks
import { useAnimate } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { useChatStore } from "../hooks/useChatStore";

// Components
import TextAreaAutoSize from "react-textarea-autosize";

// Definitions
import type { Definitions } from "..";

// Icons
import { IoSend } from "react-icons/io5";
import { CgSpinner } from "react-icons/cg";
import { MdEmojiEmotions } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";

// Variables
const emojiList = [
  { emoji: "😀", name: "grinning" },
  { emoji: "😂", name: "laughing" },
  { emoji: "🥰", name: "loving" },
  { emoji: "😍", name: "heart eyes" },
  { emoji: "🤗", name: "hugging" },
  { emoji: "😊", name: "smiling" },
  { emoji: "😎", name: "cool" },
  { emoji: "🤔", name: "thinking" },
  { emoji: "😢", name: "crying" },
  { emoji: "😭", name: "sobbing" },
  { emoji: "😡", name: "angry" },
  { emoji: "🥺", name: "pleading" },
  { emoji: "😴", name: "sleeping" },
  { emoji: "🤯", name: "mind blown" },
  { emoji: "🥳", name: "party" },
  { emoji: "👍", name: "thumbs up" },
  { emoji: "👏", name: "clapping" },
  { emoji: "🙌", name: "raised hands" },
  { emoji: "💪", name: "strong" },
  { emoji: "🤝", name: "handshake" },
  { emoji: "❤️", name: "heart" },
  { emoji: "💯", name: "hundred" },
  { emoji: "🔥", name: "fire" },
  { emoji: "✨", name: "sparkles" },
  { emoji: "🎉", name: "celebration" },
];

/**
 * The base chat input. Allows for the client to send a message (string) to the current session
 * so other clients connected to the socket can see it.
 */
export function ChatBox({ onSend }: Definitions.ChatBoxProps) {
  // States
  const [sendable, setSendable] = useState<boolean>(false);

  // Hooks
  const [error, playError] = useAnimate();
  const { sending } = useChatStore();

  // References
  const form = useRef<HTMLFormElement>(null);

  /**
   * Causes the input frame to shake and highlight in red, indicating an error has occurred
   * when the client tries to send the message.
   */
  const shake = useCallback(() => {
    playError(
      error.current,
      { rotate: [0, 1, -1, 0] },
      { duration: 0.15, ease: "easeInOut" }
    );
    playError(
      error.current,
      {
        outlineColor: [
          "rgb(255 255 255 / 0.3)",
          "rgb(239 68 68)",
          "rgb(255 255 255 / 0.3)",
        ],
      },
      { duration: 0.25, ease: "easeInOut" }
    );
  }, [error, playError]);

  /**
   * Triggers when the user submits the send message form.
   * @param e The form event.
   */
  const onSubmit = useCallback<
    (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  >(
    async (e) => {
      e.preventDefault();

      if (!sendable) {
        shake();
        return;
      }

      const result = await onSend(e);

      if (!result) {
        shake();
      } else {
        setSendable(false);
      }
    },
    [onSend, sendable, shake]
  );

  /**
   * The event for when the client enters or removes text from the message input.
   * @param e The form event.
   */
  const onChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSendable(e.target.value.trim().length > 3);
  }, []);

  return (
    <form
      ref={form}
      className={"flex flex-col w-full gap-1"}
      onSubmit={onSubmit}>
      <div
        ref={error}
        className="rounded-xl bg-white/10 text-white p-3 w-full outline-offset-[2.7px] outline-white/30 focus-within:outline-[2.5] flex flex-col gap-2 cursor-text has-[:disabled]:text-white/50">
        <div className="flex justify-between gap-2 items-center w-full">
          <TextAreaAutoSize
            className="outline-none w-full resize-none disabled:cursor-not-allowed"
            placeholder="Ask a question ..."
            disabled={sending}
            name="message"
            autoFocus
            minRows={1}
            maxRows={3}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                form.current?.requestSubmit();
              }
            }}
            onChange={onChange}
          />
          <button
            type="submit"
            className={sendable ? "cursor-pointer" : "cursor-not-allowed"}>
            {!sending ? (
              <IoSend
                className={sendable ? "text-white/50" : "text-white/30"}
              />
            ) : (
              <CgSpinner className="text-white text-lg animate-spin cursor-not-allowed" />
            )}
          </button>
        </div>
        <ActionRow />
      </div>
    </form>
  );

  /**
   * The action row attached to the input box, allows for opening things like the
   * emojis and GIF menu.
   */
  function ActionRow() {
    // Hooks
    const { emojisOpen, setEmojisOpen } = useChatStore();

    // Variables
    const items: { icon: React.ReactNode; onClick: () => void }[] = [
      {
        icon: (
          <MdEmojiEmotions
            className={`text-[18px] hover:text-white ${
              !emojisOpen ? "text-white/50" : "text-white"
            }  transition-colors`}
          />
        ),
        onClick: useCallback(() => {
          setEmojisOpen(!emojisOpen);
        }, [emojisOpen, setEmojisOpen]),
      },
      {
        icon: (
          <img
            src={Gif}
            draggable={false}
            className="aspect-square w-4 filter brightness-0 invert opacity-50 hover:opacity-100 transition-opacity"
          />
        ),
        onClick: useCallback(() => {
          console.log("clicked gif");
        }, []),
      },
    ];

    return (
      <div className="flex gap-2">
        {items.map((btn, index) => (
          <button
            key={index}
            type="button"
            onClick={btn.onClick}
            className="cursor-pointer">
            {btn.icon}
          </button>
        ))}
      </div>
    );
  }
}

/**
 * The form for allowing the user to initially enter their details; allows the session to start
 * by providing details like their name and email address.
 */
export function StartSession({
  onConnect,
  connecting,
}: Definitions.StartSessionProps) {
  return (
    <form
      className="flex flex-col rounded-xl p-4 gap-2 bg-white/2 border-1 border-white/10"
      onSubmit={onConnect}>
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
  );
}

/**
 * A notice to be displayed at the bottom of the chat window unless dismissed to allow the client
 * to understand the terms and privacy policies they agree to when continuing.
 */
export function Consent({ onDismiss }: Definitions.ConsentProps) {
  return (
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
        onClick={onDismiss}
        className="cursor-pointer hover:bg-white/10 p-1 rounded-lg transition-colors">
        <IoClose className="text-white text-xl" />
      </button>
    </div>
  );
}

/**
 * The emoji menu allowing the client to search for basic emojis and insert them into the
 * chat box.
 */
export function EmojiMenu() {
  // Hooks
  const { setEmojisOpen } = useChatStore();

  // States
  const [emojis, setEmojis] = useState<typeof emojiList>(emojiList);

  /**
   * Triggers when an emoji is selected.
   */
  const onSelect = useCallback<(emoji: string) => void>(
    (emoji) => {
      console.log(emoji);
      setEmojisOpen(false);
    },
    [setEmojisOpen]
  );

  /**
   * Triggers when the emoji search input's value is changed.
   */
  const onChanged = useCallback<(value: string) => void>((value) => {
    if (value.length > 0) {
      setEmojis(
        emojiList.filter((emoji) =>
          emoji.name.toLowerCase().includes(value.toLowerCase())
        )
      );
    } else {
      setEmojis(emojiList);
    }
  }, []);

  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: "0%", opacity: 1 }}
      transition={{ duration: 0.07 }}
      className="absolute bottom-0 left-4 right-4 mb-3 z-10 bg-[#272727] rounded-xl p-3 border-1 border-white/10 h-[200px] flex flex-col">
      <div className="flex gap-2 justify-between items-center mb-2">
        <label className="flex items-center gap-2 border-1 border-white/10 rounded-xl p-2 text-sm text-white flex-grow-1 flex-shrink-0 focus-within:border-white">
          <CiSearch className="text-lg text-white/50" />
          <input
            type="text"
            placeholder="Search for emojis ..."
            onChange={(e) => onChanged(e.target.value)}
            className="outline-none"
          />
        </label>
        <button
          className="cursor-pointer hover:bg-white/10 p-1 rounded-lg transition-colors"
          onClick={useCallback(() => setEmojisOpen(false), [setEmojisOpen])}>
          <IoClose className="text-white/50 text-xl" />
        </button>
      </div>
      {emojis.length > 0 ? (
        <div className="grid grid-cols-8 text-xl overflow-y-auto flex-1 h-0 py-1">
          {emojis.map((emoji, index) => (
            <button
              key={index}
              className="cursor-pointer hover:scale-105 transition-transform aspect-square flex items-center justify-center"
              onClick={(e) => onSelect(e.currentTarget.innerText)}>
              {emoji.emoji}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center w-full h-8/12">
          <p className="text-center text-white/50">No results found.</p>
        </div>
      )}
    </motion.div>
  );
}
