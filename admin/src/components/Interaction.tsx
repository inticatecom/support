"use client";
// Resources
import { cn } from "@/lib/utility";

// Hooks
import { useCallback, useEffect, useRef, useState } from "react";

// Components
import Link from "next/link";
import TextAreaAutosize from "react-textarea-autosize";

// Definitions
import * as Types from "@/lib/definitions";

// Icons
import { CgSpinner } from "react-icons/cg";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";

/**
 * The actual styled component behind button components.
 */
function ButtonContent({
  scheme,
  loading,
  disabled,
  className,
  children,
}: Types.ButtonContentProps) {
  return (
    <div
      className={cn(
        "flex text-black justify-center items-center bg-gray-200 px-2 py-[6px] rounded-md font-semibold hover:bg-gray-300 cursor-pointer in-disabled:cursor-not-allowed transition-colors",
        scheme === "secondary" &&
          "bg-[#151515] border-1 border-white/10 text-white hover:bg-[#181818]",
        loading &&
          (scheme === "secondary"
            ? "bg-[#070707] hover:bg-[#070707] text-white/50"
            : "bg-gray-300 hover:bg-gray-300 text-black/50"),
        disabled &&
          (scheme === "secondary"
            ? "bg-[#070707] hover:bg-[#070707] text-white/50"
            : "bg-gray-300 hover:bg-gray-300 text-black/50"),
        className
      )}>
      {!loading ? (
        children
      ) : (
        <CgSpinner
          className={cn(
            "text-2xl animate-spin",
            scheme === "secondary" && "text-white"
          )}
        />
      )}
    </div>
  );
}

/**
 * A base button component.
 */
export function Button(props: Types.ButtonProps) {
  return (
    <button
      className="contents"
      type={props.type}
      disabled={props.loading || props.disabled}
      onClick={props.onClick}>
      <ButtonContent {...props}>{props.children}</ButtonContent>
    </button>
  );
}

/**
 * The same styling as a button, but for links.
 */
export function LinkButton(props: Types.TextButtonProps) {
  return (
    <Link
      href={props.href}
      target={props.target || "_self"}
      draggable={false}
      className="contents">
      <ButtonContent {...props}>{props.children}</ButtonContent>
    </Link>
  );
}

/**
 * A link without a background, just plain text.
 */
export function TextLink(props: Types.TextLinkProps) {
  return (
    <Link
      href={props.href}
      className={cn(
        "text-white/70 underline w-fit hover:text-blue-500",
        props.className
      )}>
      {props.children}
    </Link>
  );
}

/**
 * An input user's can enter text into.
 */
export function Input(props: Types.InputProps) {
  return (
    <label className={cn("flex flex-col gap-1", props.className)}>
      <div className="flex justify-between items-center w-full">
        {props.label && (
          <p className="text-white/70">
            {props.label}
            {props.withAsterix && <span className="text-red-400"> *</span>}
          </p>
        )}
        {props.hint}
      </div>
      <div className="flex flex-col gap-[1px]">
        <div
          className={cn(
            "flex justify-between items-center gap-1 text-white bg-[#151515] border-1 border-white/10 px-3 py-2 rounded-md focus-within:border-white",
            props.disabled && "bg-[#070707] text-white/50",
            props.error && "border-red-400 focus-within:border-red-500"
          )}>
          <input
            placeholder={props.placeholder}
            type={props.type}
            disabled={props.disabled}
            defaultValue={props.defaultValue}
            className="outline-none flex-grow-1 disabled:cursor-not-allowed"
            ref={props.ref}
            {...props.register}
          />
          {props.rightSide}
        </div>
        {props.error && <p className="text-red-400 text-sm">{props.error}</p>}
      </div>
    </label>
  );
}

/**
 * An expanded version of the input element.
 */
export function TextArea(props: Types.TextAreaProps) {
  return (
    <label className={cn("flex flex-col gap-1", props.className)}>
      <div className="flex justify-between items-center w-full">
        {props.label && (
          <p className="text-white/70">
            {props.label}
            {props.withAsterix && <span className="text-red-400"> *</span>}
          </p>
        )}
        {props.hint}
      </div>
      <div className="flex flex-col gap-[1px]">
        <div
          className={cn(
            "flex justify-between items-center gap-1 text-white bg-[#151515] border-1 border-white/10 px-3 py-2 rounded-md focus-within:border-white",
            props.disabled && "bg-[#070707] text-white/50",
            props.error && "border-red-400 focus-within:border-red-500"
          )}>
          <TextAreaAutosize
            placeholder={props.placeholder}
            disabled={props.disabled}
            className="outline-none flex-grow-1 resize-none disabled:cursor-not-allowed"
            ref={props.ref}
            minRows={props.minRows || 1}
            maxRows={props.maxRows || 3}
            {...props.register}
          />
        </div>
        {props.error && <p className="text-red-400 text-sm">{props.error}</p>}
      </div>
    </label>
  );
}

/**
 * A dropdown menu users can select options from.
 */
export function Select({
  defaultId,
  list,
  onChange,
  className,
  name,
  label,
  withAsterix,
}: Types.SelectProps) {
  // States
  const [visible, setVisible] = useState<boolean>(false);
  const [value, setValue] = useState<string | undefined>(undefined);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Variables
  const selectedItem = list.find((item) => item.id === value);

  /**
   * Sets the current value of the input.
   */
  const set = useCallback((newValue: string) => {
    setValue(newValue);
    setVisible(false);
    setFocusedIndex(-1);
    buttonRef.current?.focus();
  }, []);

  /**
   * Handle keyboard navigation.
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!visible) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          setVisible(true);
          setFocusedIndex(0);
        }
        return;
      }

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          setVisible(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, list.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < list.length) {
            set(list[focusedIndex].id);
          }
          break;
      }
    },
    [visible, focusedIndex, list, set]
  );

  // Initialize value when list changes.
  useEffect(() => {
    if (!value && list.length > 0) {
      const initialValue = defaultId || list[0].id;
      setValue(initialValue);
    }
  }, [list, defaultId, value]);

  // Invoke the 'onChange' listener when the value is changed.
  useEffect(() => {
    if (onChange && value !== undefined) {
      console.log("changed");
      onChange(value);
    }
  }, [value, onChange]);

  // Close the dropdown when clicking outside of the view.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setVisible(false);
        setFocusedIndex(-1);
      }
    };

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [visible]);

  return (
    <div
      ref={containerRef}
      className={cn("w-fit h-fit flex flex-col gap-1 relative", className)}>
      {label && (
        <p className="text-white/70">
          {label}
          {withAsterix && <span className="text-red-400"> *</span>}
        </p>
      )}

      <button
        ref={buttonRef}
        type="button"
        name={name}
        onClick={useCallback(() => setVisible(!visible), [visible])}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex justify-between items-center gap-2 border-1 bg-[#151515] border-white/10 px-3 py-2 rounded-md text-white text-left cursor-pointer",
          "focus:border-white focus:outline-none",
          visible && "border-white"
        )}
        aria-expanded={visible}
        aria-haspopup="listbox">
        <span className="truncate">
          {selectedItem?.name || "Select an option..."}
        </span>
        <span className="text-white/30 text-xl flex-shrink-0">
          {visible ? (
            <MdOutlineKeyboardArrowUp />
          ) : (
            <MdOutlineKeyboardArrowDown />
          )}
        </span>
      </button>

      {visible && (
        <div
          className="absolute top-[110%] left-0 flex flex-col gap-1 w-full border-1 border-white/10 bg-[#151515] text-white rounded-md p-1 z-10 shadow-lg"
          role="listbox">
          {list.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => set(item.id)}
              className={cn(
                "w-full cursor-pointer hover:bg-white/10 rounded-sm px-2 py-2 text-left",
                item.id === value && "bg-white/10",
                index === focusedIndex && "bg-white/20"
              )}
              role="option"
              aria-selected={item.id === value}>
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * A tip that appears when hovering over the provided element.
 */
export function Tooltip({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative contents">
      {children}
      <p className="absolute pointer-events-none bg-[#070707] border-1 border-white/10 rounded-lg text-white px-2 py-1 text-sm top-0">
        test
      </p>
    </div>
  );
}
