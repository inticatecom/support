// Resources
import { useAnimate } from "motion/react";
import { useCallback, useState } from "react";

// Icons
import { IoSend } from "react-icons/io5";
import { CgSpinner } from "react-icons/cg";
import { MdEmojiEmotions } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import Gif from "../assets/images/gif.svg";

// Interfaces
interface ChatProps {
  onSend: (e: React.FormEvent<HTMLFormElement>) => Promise<boolean>;
  sending: boolean;
}
interface StartSessionProps {
  onConnect: (e: React.FormEvent<HTMLFormElement>) => void;
  connecting: boolean;
}
interface ConsentProps {
  onDismiss: () => void;
}

/**
 * The base chat input. Allows for the client to send a message (string) to the current session
 * so other clients connected to the socket can see it.
 */
export function Chat({ onSend, sending }: ChatProps) {
  // States
  const [sendable, setSendable] = useState<boolean>(false);

  // Hooks
  const [error, playError] = useAnimate();

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
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSendable(e.target.value.length > 3);
  }, []);

  return (
    <form className={"flex flex-col w-full gap-1"} onSubmit={onSubmit}>
      <div
        ref={error}
        className="rounded-xl bg-white/10 text-white p-3 w-full outline-offset-[2.7px] outline-white/30 focus-within:outline-[2.5] flex flex-col gap-2 cursor-text has-[:disabled]:text-white/50">
        <div className="flex justify-between items-center w-full">
          <input
            className="outline-none w-full disabled:cursor-not-allowed"
            type="text"
            placeholder="Ask a question ..."
            disabled={sending}
            name="message"
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
    const items: { icon: React.ReactNode; onClick: () => void }[] = [
      {
        icon: (
          <MdEmojiEmotions className="text-white/50 text-[18px] hover:text-white" />
        ),
        onClick: useCallback(() => {
          console.log("clicked emojis");
        }, []),
      },
      {
        icon: (
          <img
            src={Gif}
            draggable={false}
            className="aspect-square w-4 filter brightness-0 invert opacity-50 hover:opacity-100"
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
export function StartSession({ onConnect, connecting }: StartSessionProps) {
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
export function Consent({ onDismiss }: ConsentProps) {
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
