"use client";
// Resources
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/app/api/auth/sign-up/route";
import ky from "ky";

// Types
type SignUpData = z.infer<typeof signUpSchema>;

// Hooks
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

// Components
import { Card, Separator, Callout } from "@/components/View";
import { TextLink, Input, Button } from "@/components/Interaction";
import Link from "next/link";

// Icons
import { FaGithub } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { IoEyeSharp, IoEyeOff } from "react-icons/io5";
import { useRouter } from "next/navigation";

/**
 * Client component to display the sign-up page interface.
 */
export default function SignUp() {
  // States
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showPass, setShowPass] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Hooks
  const {
    register,
    handleSubmit,
    formState: { errors },
    resetField,
  } = useForm<SignUpData>({ resolver: zodResolver(signUpSchema) });
  const router = useRouter();

  /**
   * Function that triggers when the login form is submitted.
   */
  const onSubmit = useCallback(
    async (data: SignUpData) => {
      setSubmitting(true);
      setFormError(null);

      try {
        const response = await ky
          .post<{ success?: boolean }>("/api/auth/sign-up", { json: data })
          .json();
        if (!response?.success) throw new Error("Failed.");
        router.push("/dashboard");
      } catch (e) {
        resetField("password");
        setFormError(await (e as { response: Response }).response.text());
      } finally {
        setSubmitting(false);
      }
    },
    [resetField, router]
  );

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <Card className="w-[90%] sm:w-[70%] md:w-[60%] lg:w-1/2 xl:w-[40%] 2xl:w-[30%]">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1">
            <h1 className="font-semibold text-3xl text-white">
              Create Account
            </h1>
            <p className="text-white/70">
              Create an account with us to access the dashboard.
            </p>
          </div>
          {formError && <Callout type="error">{formError}</Callout>}
          <div className="flex justify-center gap-3">
            <Input
              label="Full Name"
              withAsterix
              placeholder="John Doe"
              disabled={submitting}
              register={register("name")}
              error={errors.name?.message}
              className="flex-grow-1"
            />
            <Input
              label="Email"
              withAsterix
              placeholder="john@doe.com"
              disabled={submitting}
              register={register("email")}
              error={errors.email?.message}
              className="flex-grow-1"
            />
          </div>
          <Input
            label="Password"
            type={showPass ? "text" : "password"}
            withAsterix
            placeholder="super password"
            rightSide={
              <button
                type="button"
                className="cursor-pointer"
                onClick={useCallback(() => {
                  setShowPass(!showPass);
                }, [showPass])}>
                <span className="text-xl text-white/70">
                  {showPass ? <IoEyeSharp /> : <IoEyeOff />}
                </span>
              </button>
            }
            disabled={submitting}
            register={register("password")}
            error={errors.password?.message}
          />
          <Button type="submit" loading={submitting} disabled={submitting}>
            Create Account
          </Button>
          <Separator label="Connections" />
          <Button
            type="button"
            scheme="secondary"
            disabled={submitting}
            className="flex justify-center items-center gap-2">
            <FaGithub className="text-lg" />
            <p>Continue with GitHub</p>
          </Button>
          <TextLink href="/auth/login" className="self-center">
            Login to Account
          </TextLink>
        </form>
      </Card>
      <p className="text-white/50 max-w-4/5 text-center">
        By continuing, you agree to our{" "}
        <TextLink href="/legal/terms" className="text-white/50">
          terms
        </TextLink>{" "}
        and{" "}
        <TextLink href="/legal/privacy-policy" className="text-white/50">
          privacy policy
        </TextLink>
        .
      </p>
    </div>
  );
}
