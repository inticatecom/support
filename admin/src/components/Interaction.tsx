// Resources
import { cn } from "@/lib/utility";

// Definitions
import { Class, Children } from "@/lib/definitions";
import Link from "next/link";
type ButtonProps = {
  type?: "submit" | "button";
  scheme?: "primary" | "secondary";
} & Class &
  Children;
type InputProps = {
  label?: string;
  placeholder?: string;
  withAsterix?: boolean;
  type?: "text" | "password";
  rightSide?: React.ReactNode;
} & Class;
type TextLinkProps = {
  children: string;
  href: string;
} & Class;

/**
 * A base button component.
 */
export function Button({ children, type, className, scheme }: ButtonProps) {
  return (
    <button
      className={cn(
        "bg-gray-100 px-2 py-[6px] rounded-md font-semibold hover:bg-white cursor-pointer transition-colors",
        scheme === "secondary" &&
          "bg-[#151515] border-1 border-white/10 text-white hover:bg-[#181818]",
        className
      )}
      type={type}>
      {children}
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
        "text-white/70 underline hover:text-blue-500",
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
    <label className="flex flex-col gap-1">
      <div className="flex justify-between items-center w-full">
        {props.label && (
          <p className="text-white/70">
            {props.label}
            {props.withAsterix && <span className="text-red-400"> *</span>}
          </p>
        )}
        {props.rightSide}
      </div>
      <input
        placeholder={props.placeholder}
        type={props.type}
        className={cn(
          "text-white bg-[#151515] border-1 border-white/10 px-3 py-2 rounded-md outline-none focus:border-white",
          props.className
        )}
      />
    </label>
  );
}
