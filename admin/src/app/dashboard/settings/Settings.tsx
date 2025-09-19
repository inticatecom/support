// Definitions
import { Children } from "@/lib/definitions";
interface SettingCardProps extends Children {
  title: string;
  description: string;
  showBtn?: React.ReactNode;
  onSave?: () => void | Promise<void>;
}

// Components
import { Card, Page, Separator } from "@/components/View";
import { Button, Input } from "@/components/Interaction";

// Icons
import { FaSave } from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";

/**
 * The client-side settings view.
 */
export default function Settings() {
  // Variables
  const settings: { title: string; content: SettingCardProps[] }[] = [
    {
      title: "Organization",
      content: [
        {
          title: "Organization Name",
          description:
            "The main name for your organization. This name is displayed to your team member's and on the live chat widget.",
          children: <Input placeholder="Acme Inc." />,
          showBtn: <FaSave />,
        },
        {
          title: "API Key",
          description:
            "Regenerate your organization's API key. Please keep in mind that this will invalidate the old token so you will have to re-enter your API key's manually.",
          children: <Input placeholder="ABCD-1234-5678" disabled />,
          showBtn: <IoMdRefresh />,
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
      ],
    },
  ];

  return (
    <Page title="Settings">
      <div className="flex flex-col w-full h-full">
        <div className="flex flex-col gap-1">
          <h1 className="text-white font-semibold text-4xl">
            Organization Settings
          </h1>
          <p className="text-white/70 text-lg">
            Make changes to the entire organization. The changes are visible to
            the entire organization and user-base.
          </p>
        </div>
        <div className="flex flex-col mt-5 gap-2 max-h-full overflow-auto">
          {settings.map((category, index) => (
            <div key={index} className="flex flex-col gap-3">
              <Separator label={category.title} />
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3">
                {category.content.map((setting, index) => (
                  <SettingCard key={index} {...setting} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );

  /**
   * Represents a setting option.
   */
  function SettingCard(props: SettingCardProps) {
    return (
      <Card className="flex flex-col justify-between gap-2 w-full p-4">
        <div className="flex flex-col gap-x-11">
          <h3 className="font-semibold text-xl">{props.title}</h3>
          <p className="text-white/70">{props.description}</p>
        </div>
        <div className="flex justify-center items-center gap-2">
          <div className="flex-grow-1">{props.children}</div>
          {props.showBtn && (
            <Button className="aspect-square text-xl">{props.showBtn}</Button>
          )}
        </div>
      </Card>
    );
  }
}
