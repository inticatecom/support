// Components
import {
  Button,
  Input,
  Select,
  TextArea,
  TextLink,
} from "@/components/Interaction";
import { Card } from "@/components/View";

export default function CreateOrganization() {
  return (
    <Card className="w-1/3">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-3xl">Create Organization</h1>
        <p className="text-white/70">
          Get started by creating an organization.
        </p>
      </div>
      <form className="flex flex-col gap-3 mt-3">
        <div className="w-full flex gap-2">
          <Input
            label="Organization Name"
            withAsterix
            placeholder="Acme Inc."
            className="w-1/2"
          />
          <Input
            label="License Key"
            withAsterix
            hint={<TextLink href="/purchase">Purchase Key</TextLink>}
            placeholder="ABCD-1234-5678"
            className="w-1/2"
          />
        </div>
        <TextArea
          label="Organization Summary"
          withAsterix
          placeholder="The main live chat dashboard for Acme Inc."
        />
        <TextArea
          label="What is your use-case for this organization?"
          placeholder="I plan to use the live chat to ..."
          minRows={2}
        />
        <div className="w-full flex gap-2">
          <Select
            label="How large is your team?"
            list={[{ id: "10", name: "0-10 Employees" }]}
            className="w-1/2"
          />
          <Select
            label="What is your user-base?"
            list={[{ id: "10", name: "0-10 Users" }]}
            className="w-1/2"
          />
        </div>
        <div className="flex gap-2 w-full">
          <Button type="button" scheme="secondary" className="w-1/2">
            Get Access
          </Button>
          <Button className="w-1/2">Create Organization</Button>
        </div>
      </form>
    </Card>
  );
}
