"use client";
// Resources
import z from "zod";
import { createOrg } from "@/app/api/organizations/route";
import { zodResolver } from "@hookform/resolvers/zod";
import ky from "ky";
import { handleError } from "@/lib/utility";

// Hooks
import { useForm } from "react-hook-form";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

// Components
import { Callout, Card, Separator } from "@/components/View";
import {
  Input,
  TextLink,
  TextArea,
  Select,
  LinkButton,
  Button,
} from "@/components/Interaction";

/**
 * The client-side page for creating organizations.
 */
export default function CreateOrganization() {
  // Hooks
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<z.infer<typeof createOrg>>({ resolver: zodResolver(createOrg) });
  const [creating, setCreating] = useState<boolean>(false);
  const router = useRouter();

  /**
   * Triggers when the client submits the form.
   */
  const onSubmit = useCallback(
    async (data: z.infer<typeof createOrg>) => {
      setCreating(true);
      clearErrors("root");

      try {
        await ky.post("/api/organizations", {
          json: data,
        });

        router.push("/");
      } catch (e) {
        setError("root", {
          message: await handleError(e),
        });
      } finally {
        setCreating(false);
      }
    },
    [setError, clearErrors, router]
  );

  return (
    <Card className="w-[90%] sm:w-[70%] md:w-[60%] lg:w-1/2 xl:w-[40%] 2xl:w-[30%]">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-3xl">Create Organization</h1>
          <p className="text-white/70">
            Get started by creating an organization.
          </p>
        </div>
        {errors.root?.message && (
          <Callout type="error">{errors.root.message}</Callout>
        )}
        <div className="w-full flex gap-2">
          <Input
            label="Organization Name"
            withAsterix
            placeholder="Acme Inc."
            className="w-1/2"
            register={register("name")}
            error={errors.name?.message}
            disabled={creating}
          />
          <Input
            label="License Key"
            withAsterix
            hint={
              <TextLink href="/purchase" className="text-sm">
                Purchase Key
              </TextLink>
            }
            placeholder="ABCD-1234-5678"
            className="w-1/2"
            disabled={creating}
          />
        </div>
        <TextArea
          label="Organization Summary"
          withAsterix
          placeholder="The main live chat dashboard for Acme Inc."
          register={register("summary")}
          error={errors.summary?.message}
          disabled={creating}
        />
        <TextArea
          label="What is your use-case for this organization?"
          placeholder="I plan to use the live chat to ..."
          minRows={2}
          register={register("useCase")}
          error={errors.useCase?.message}
          disabled={creating}
        />
        <div className="w-full flex gap-2">
          <Select
            label="How large is your team?"
            list={[
              { id: "10", name: "0-10 Employees" },
              { id: "50", name: "10-50 Employees" },
              { id: "100", name: "100+ Employees" },
            ]}
            className="w-1/2"
          />
          <Select
            label="What is your user-base?"
            list={[
              { id: "100", name: "0-100 Users" },
              { id: "500", name: "100-500 Users" },
              { id: "1000", name: "1,000+ Users" },
            ]}
            className="w-1/2"
          />
        </div>
        <Separator />
        <div className="flex gap-2 w-full">
          <LinkButton
            scheme="secondary"
            className="w-1/2"
            disabled={creating}
            href="/dashboard">
            Go Back
          </LinkButton>
          <Button className="w-1/2" loading={creating}>
            Create Organization
          </Button>
        </div>
      </form>
    </Card>
  );
}
