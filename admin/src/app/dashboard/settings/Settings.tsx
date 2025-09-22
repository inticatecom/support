"use client";
// Resources
import ky from "ky";

// Definitions
import { Children } from "@/lib/definitions";
interface SettingCardProps extends Children {
  title: string;
  description: string;
  showBtn?: React.ReactNode;
  onAction?: () => void | Promise<void>;
}

// Hooks
import { useCallback, useRef } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { useQuery } from "@tanstack/react-query";

// Components
import { Card, Page, Separator } from "@/components/View";
import { Button, Input, TextArea } from "@/components/Interaction";

// Icons
import { FaSave } from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";
import { FaCopy } from "react-icons/fa6";

/**
 * The client-side settings view.
 */
export default function Settings() {
  // Hooks
  const { org } = useOrganization();
  const { data: apiKey, refetch } = useQuery({
    queryKey: ["apiKey"],
    queryFn: async () => {
      return await ky.get<string>(`/api/organizations/${org?.id}/key`).text();
    },
    enabled: !!org?.id,
  });

  // References
  const copyKeyRef = useRef<HTMLInputElement>(null);

  /**
   * Copies the provided value to the client's clipboard.
   */
  const copy = useCallback(
    async (content: string) => await navigator.clipboard.writeText(content),
    []
  );

  /**
   * Regenerate the API key for the current organization.
   */
  const regenKey = useCallback(async () => {
    (await ky.patch<string>(`/api/organizations/${org?.id}/key`)).text();
    await refetch();
  }, [org?.id, refetch]);

  // Variables
  const settings: { title: string; content: SettingCardProps[] }[] = [
    {
      title: "Organization",
      content: [
        {
          title: "Organization Name",
          description:
            "The main name for your organization. This name is displayed to your team members and on the live chat widget.",
          children: <Input placeholder="Acme Inc." defaultValue={org?.name} />,
          showBtn: <FaSave />,
        },
        {
          title: "Organization Summary",
          description:
            "The summary/description of your organization. Mainly used internally to help members identify the organization easier.",
          children: (
            <TextArea
              placeholder="This is my organization's summary ..."
              defaultValue={org?.summary}
            />
          ),
          showBtn: <FaSave />,
        },
        {
          title: "API Key",
          description:
            "Regenerate your organization's API key. Please keep in mind that this will invalidate the old token so you will have to re-enter your API key's manually.",
          children: (
            <Input
              disabled
              defaultValue={apiKey || ""}
              ref={copyKeyRef}
              rightSide={
                <button
                  className="cursor-pointer"
                  onClick={() => copy(copyKeyRef.current?.value || "")}>
                  <FaCopy />
                </button>
              }
            />
          ),
          showBtn: <IoMdRefresh />,
          onAction: async () => {
            await regenKey();
          },
        },
        {
          title: "Delete Organization",
          description:
            "Delete the currently selected organization. Please keep in mind this action is irreversible.",
          children: (
            <Button className="bg-red-600 text-white hover:bg-red-500">
              Delete Organization
            </Button>
          ),
        },
      ],
    },
    {
      title: "Live Chat Widget",
      content: [
        {
          title: "Widget Heading",
          description:
            "The heading to display at the top of the live chat widget. Usually a welcome message or response time indicator.",
          children: <Input placeholder="Welcome. How can we help?" />,
          showBtn: <FaSave />,
        },
        {
          title: "Greeting Message",
          description:
            "The message to send to the user when the first connect to the chat. Usually a message asking what the user needs help.",
          children: (
            <TextArea placeholder="Hey, there! Thanks for contacting us, how may we assist you?" />
          ),
          showBtn: <FaSave />,
        },
      ],
    },
  ];

  return (
    <Page title="Settings">
      <Page.Heading description="Make changes to the entire organization. The changes are visible to the entire organization and user-base.">
        Organization Settings
      </Page.Heading>
      <div className="flex flex-col mt-5 gap-2 max-h-full overflow-auto">
        {settings.map((category, index) => (
          <div key={index} className="flex flex-col gap-3">
            <Separator label={category.title} />
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3">
              {category.content.map((setting, index) => (
                <Setting key={index} {...setting} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Page>
  );

  /**
   * Represents a setting option.
   */
  function Setting(props: SettingCardProps) {
    return (
      <Card className="flex flex-col justify-between gap-2 w-full p-4">
        <div className="flex flex-col gap-x-11">
          <h3 className="font-semibold text-xl">{props.title}</h3>
          <p className="text-white/70">{props.description}</p>
        </div>
        <div className="flex justify-center items-start gap-2">
          <div className="flex-1">{props.children}</div>
          {props.showBtn && (
            <Button
              className="aspect-square text-xl min-h-10 max-h-16 h-10 flex-shrink-0"
              onClick={() => {
                if (props.onAction) {
                  props.onAction();
                }
              }}>
              {props.showBtn}
            </Button>
          )}
        </div>
      </Card>
    );
  }
}
