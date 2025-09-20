"use client";
// Resources
import moment from "moment";
import { cn } from "@/lib/utility";

// Components
import { Page } from "@/components/View";
import { Input, TextArea } from "@/components/Interaction";

// Definitions
interface MessageBoxProps {
  from: string;
  summary: string;
  time: Date;
  newMessages?: boolean;
}
interface BubbleProps {
  message: string;
  mode?: "primary" | "secondary";
}

/**
 * Client-side page for viewing messages from users for the currently selected organization.
 */
export default function Inbox() {
  return (
    <Page title="Inbox">
      <div className="flex gap-8 w-full h-full">
        <div className="flex flex-col gap-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 max-h-full">
          <Input placeholder="Search here ..." />
          <div className="flex flex-col w-full gap-2 flex-grow-1 overflow-y-auto">
            {Array.from({ length: 30 }).map((_, index) => (
              <MessageBox
                key={index}
                from="Lucas Stranks"
                summary="Hey, for some reason the ..."
                time={new Date()}
                newMessages={index === 0}
              />
            ))}
          </div>
        </div>
        <div className="h-full flex-grow-1 flex flex-col">
          <div className="flex flex-col gap-2 flex-grow-1 max-h-full overflow-y-auto">
            {Array.from({ length: 30 }).map((_, index) => (
              <Bubble
                key={index}
                mode={index % 2 ? "secondary" : "primary"}
                message={`This is message ${index}! This is just a demo message to demonstrate the scaling of multiple messages.`}
              />
            ))}
          </div>
          <TextArea
            className="flex-grow-1 mt-1 text-lg"
            placeholder="This is a message ..."
          />
        </div>
      </div>
    </Page>
  );

  function MessageBox(props: MessageBoxProps) {
    return (
      <button className="flex flex-col justify-center items-start bg-[#101010] rounded-lg border-1 border-white/10 p-3 hover:bg-[#141414] cursor-pointer transition-colors">
        <div className="w-full flex justify-between">
          <h3 className="text-white font-semibold text-start">{props.from}</h3>
          <p className="text-[13px] text-white/50 text-end">
            {moment(props.time).fromNow()}
          </p>
        </div>
        <p
          className={cn(
            "text-sm text-white/70 text-start",
            props.newMessages && "text-white font-semibold"
          )}>
          {props.summary}
        </p>
      </button>
    );
  }

  function Bubble(props: BubbleProps) {
    return (
      <p
        className={cn(
          "max-w-3/4 text-wrapped w-fit rounded-lg px-3 py-2 text-lg",
          props.mode === "secondary" ? "bg-blue-500/15 self-end" : "bg-white/15"
        )}>
        {props.message}
      </p>
    );
  }
}
