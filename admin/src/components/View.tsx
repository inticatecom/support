"use client";
// Resources
import { cn } from "@/lib/utility";

// Hooks
import { usePathname } from "next/navigation";

// Definitions
import { Children, Class } from "@/lib/definitions";
interface CardProps extends Class {
  children: React.ReactNode;
}
interface SeparatorProps extends Class {
  label?: string;
}
type CalloutProps = {
  type?: "success" | "warning" | "error";
} & Class &
  Children;

// Components
import Link from "next/link";
import Image from "next/image";
import { Button } from "./Interaction";

// Icons
import { MdOutlineSpaceDashboard, MdOutlineSupportAgent } from "react-icons/md";
import { FiSettings } from "react-icons/fi";

/**
 * A base card component, used for holding content.
 */
export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "bg-[#070707] border-1 border-white/10 rounded-lg p-6",
        className
      )}>
      {children}
    </div>
  );
}

/**
 * Create a separator to separate content from another section.
 */
export function Separator({ label, className }: SeparatorProps) {
  function Spacer({ className }: Class) {
    return <span className={cn("bg-white/10 w-full h-[1px]", className)} />;
  }

  return !label ? (
    <Spacer className={className} />
  ) : (
    <div
      className={cn(
        "w-full flex justify-center items-center gap-2",
        className
      )}>
      <Spacer />
      <p className="text-white/10 w-fit">{label}</p>
      <Spacer />
    </div>
  );
}

/**
 * A grid background texture.
 */
export function Grid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-white dark:bg-black">
      <div
        className={cn(
          "absolute inset-0 [background-size:40px_40px] [background-image:linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)]",
          className
        )}>
        {children}
      </div>
    </div>
  );
}

/**
 * A callout to display a type of message to a user.
 */
export function Callout({
  children,
  type = "success",
  className,
}: CalloutProps) {
  const color =
    type === "success"
      ? "bg-green-500/10 border-green-500/20"
      : type === "warning"
      ? "bg-orange-500/10 border-orange-500/20"
      : type === "error"
      ? "bg-red-500/10 border-red-500/20"
      : "";

  return (
    <p
      className={cn("border-1 rounded-lg p-2 text-white/80", color, className)}>
      {children}
    </p>
  );
}

/**
 * The dashboard sidebar component displaying a navigational menu to navigate throughout
 * the application.
 */
export function SideBar() {
  // Hooks
  const path = usePathname();

  // Variables
  const items: { text: string; href: string; icon: React.ReactNode }[] = [
    {
      text: "Dashboard",
      href: "/",
      icon: <MdOutlineSpaceDashboard />,
    },
    {
      text: "Test 1",
      href: "/test1",
      icon: <FiSettings />,
    },
    {
      text: "Test 2",
      href: "/test2",
      icon: <MdOutlineSpaceDashboard />,
    },
    {
      text: "Test 3",
      href: "/test3",
      icon: <MdOutlineSpaceDashboard />,
    },
  ];

  return (
    <div className="flex flex-col w-[80px] fixed left-0 top-0 bg-[#050505] h-screen border-r-[1px] border-white/10 p-4">
      <div className="flex flex-col gap-1 h-full">
        <div className="aspect-square w-full relative">
          <Image
            src="/assets/images/icon.png"
            alt="Icon Logo"
            layout="fill"
            draggable={false}
            className="aspect-square rounded-lg border-1 border-white/10"
          />
        </div>
        <Separator className="my-1" />
        {items.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            draggable={false}
            className={cn(
              "text-white text-2xl hover:bg-white/10 border-1 border-[#050505] hover:border-white/10 rounded-lg p-[6px] font-semibold flex gap-1 justify-center items-center transition-colors aspect-square w-full",
              item.href === path && "bg-white/10 border-1 border-white/10"
            )}>
            <span className="text-2xl">{item.icon}</span>
          </Link>
        ))}
      </div>
      <Button scheme="secondary" className="aspect-square w-full rounded-lg">
        <MdOutlineSupportAgent className="text-2xl" />
      </Button>
    </div>
  );
}
