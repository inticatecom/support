// Resources
import { cn } from "@/lib/utility";

// Components
import Link from "next/link";

// Definitions
import { Class, Children } from "@/lib/definitions";
import type { UseFormRegisterReturn } from "react-hook-form";
type ButtonProps = {
  type?: "submit" | "button";
  scheme?: "primary" | "secondary";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  loading?: boolean;
  disabled?: boolean;
} & Class &
  Children;
type InputProps = {
  label?: string;
  placeholder?: string;
  withAsterix?: boolean;
  type?: "text" | "password";
  hint?: React.ReactNode;
  rightSide?: React.ReactNode;
  disabled?: boolean;
  error?: string;
  register?: UseFormRegisterReturn;
} & Class;
type TextLinkProps = {
  children: string;
  href: string;
} & Class;

// Icons
import { CgSpinner } from "react-icons/cg";

/**
 * A base button component.
 */
export function Button({
  children,
  type,
  className,
  scheme,
  onClick,
  loading,
  disabled,
}: ButtonProps) {
  return (
    <button
      className={cn(
        "flex justify-center items-center bg-gray-100 px-2 py-[6px] rounded-md font-semibold hover:bg-white cursor-pointer disabled:cursor-not-allowed transition-colors",
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
      )}
      type={type}
      disabled={loading || disabled}
      onClick={onClick}>
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
    </button>
  );
}

/**
 * A link without a background, just plain text.
 */
export function TextLink(props: TextLinkProps) {
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
export function Input(props: InputProps) {
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
            className="outline-none flex-grow-1 disabled:cursor-not-allowed"
            {...props.register}
          />
          {props.rightSide}
        </div>
        {props.error && <p className="text-red-400 text-sm">{props.error}</p>}
      </div>
    </label>
  );
}
