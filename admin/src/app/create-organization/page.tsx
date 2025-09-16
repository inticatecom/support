// Components
import { Button, Input, TextArea, TextLink } from "@/components/Interaction";
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
            className="flex-grow-1"
          />
          <Input
            label="Access Key"
            withAsterix
            hint={<TextLink href="/purchase">Purchase Key</TextLink>}
            placeholder="1234-5678"
            className="flex-grow-1"
          />
        </div>
        <TextArea
          label="Organization Summary"
          withAsterix
          placeholder="The main live chat dashboard for Acme Inc."
        />
        <div className="flex gap-2 w-full">
          <Button type="button" scheme="secondary" className="flex-grow-1">
            Get Access
          </Button>
          <Button className="flex-grow-1">Create Organization</Button>
        </div>
      </form>
    </Card>
  );
}
