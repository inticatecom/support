"use client";
// Resources
import { cn } from "@/lib/utility";
import { signOut } from "next-auth/react";

// Definitions
import * as Types from "@/lib/definitions";

// Components
import Link from "next/link";
import Image from "next/image";
import { Select } from "./Interaction";

// Icons
import { MdLogout } from "react-icons/md";
import { CgSpinner } from "react-icons/cg";
import { FaInbox } from "react-icons/fa6";

/**
 * A base card component, used for holding content.
 */
export function Card({ children, className }: Types.CardProps) {
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
export function Separator({ label, className }: Types.SeparatorProps) {
  function Spacer({ className }: Types.Class) {
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
}: Types.CalloutProps) {
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
 * The container for a page displayed on the dashboard.
 */
export function Page(props: Types.PageProps) {
  const items: { path: string; icon: React.ReactNode; className?: string }[] = [
    {
      path: "/dashboard/inbox",
      icon: <FaInbox />,
    },
  ];

  return (
    <Card className="w-[85%] h-10/12 relative p-0">
      {!props.loading ? (
        <div className="grid grid-cols-[60px_1fr] grid-rows-[60px_1fr] h-full">
          <div className="flex flex-col items-center gap-2 p-2 border-r-1 border-b-1 border-white/10">
            <Link
              href="/dashboard"
              draggable={false}
              className="aspect-square w-full relative">
              <Image
                src="/assets/images/icon.png"
                alt="Icon Logo"
                layout="fill"
                draggable={false}
                className="aspect-square rounded-lg border-1 border-white/10 hover:border-white/20 transition-colors"
              />
            </Link>
          </div>

          <div className="border-b-1 border-white/10 p-2 flex justify-between items-center">
            <Select
              list={[
                { id: "test", name: "Demo Organization" },
                { id: "test2", name: "Another Organization" },
              ]}
            />
            {props.title && (
              <p className="absolute left-1/2 transform -translate-x-1/2 text-white text-lg">
                {props.title}
              </p>
            )}
            <div className="w-[200px]" />
          </div>

          <div className="flex flex-col items-center py-3 gap-2 border-r-1 border-white/10">
            {/* <SideLink icon={<IoLogOutSharp />} /> */}
            {items.map((item, index) => (
              <PageLink key={index} href={item.path} className={item.className}>
                {item.icon}
              </PageLink>
            ))}

            <button
              onClick={async () => await signOut()}
              className="text-red-400 bg-red-400/10 hover:bg-red-400/20 p-2 text-xl rounded-lg mt-auto cursor-pointer transition-colors">
              <MdLogout />
            </button>
          </div>

          <div className="px-5 py-4 overflow-auto">{props.children}</div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-full">
          <CgSpinner className="text-white text-4xl animate-spin" />
        </div>
      )}
    </Card>
  );

  /**
   * An item displayed in the side bar of the page.
   */
  function PageLink(props: Types.PageLinkProps) {
    return (
      <Link
        href={props.href}
        className={cn(
          "text-white bg-white/10 hover:bg-white/20 p-2 text-xl rounded-lg transition-colors",
          props.className
        )}>
        {props.children}
      </Link>
    );
  }
}
