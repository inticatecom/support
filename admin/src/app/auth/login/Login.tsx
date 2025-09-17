"use client";
// Resources
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";

// Definitions
type LoginFormData = z.infer<typeof loginSchema>;

// Components
import { Button, Input, TextLink } from "@/components/Interaction";
import { Card, Separator, Callout } from "@/components/View";

// Hooks
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

// Icons
import { FaGithub } from "react-icons/fa";
import { IoEyeSharp, IoEyeOff } from "react-icons/io5";

// Variables
const loginSchema = z.object({
  email: z
    .email("You must provide a valid email.")
    .min(3, "Email must be of the valid format."),
  password: z
    .string("The password is required.")
    .min(8, "The password requires at least 8 characters."),
});

/**
 * The login page to gain access to the dashboard.
 */
export default function Login() {
  // States
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [authenticating, setAuthenticating] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState<boolean>(false);

  // Hooks
  const {
    register,
    handleSubmit,
    formState: { errors },
    resetField,
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const router = useRouter();

  /**
   * Function that triggers when the login form is submitted.
   */
  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      setSubmitting(true);
      setFormError(null);

      try {
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (!result?.error && result?.ok) {
          router.push("/dashboard");
        } else {
          setFormError(result.code || "Internal server error.");
          resetField("password");
        }
      } catch {
        setFormError("Internal server error.");
        resetField("password");
      } finally {
        setSubmitting(false);
      }
    },
    [router, resetField]
  );

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <Card className="w-[90%] sm:w-[70%] md:w-[60%] lg:w-1/2 xl:w-[40%] 2xl:w-[30%]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-semibold text-3xl text-white">Welcome Back</h1>
            <p className="text-white/70">
              Login to your account to access the dashboard.
            </p>
          </div>
          {formError && <Callout type="error">{formError}</Callout>}
          <Input
            label="Email"
            withAsterix
            placeholder="john@doe.com"
            disabled={submitting || authenticating}
            register={register("email")}
            error={errors.email?.message}
          />
          <Input
            label="Password"
            type={showPass ? "text" : "password"}
            withAsterix
            placeholder="super password"
            hint={
              <TextLink href="/auth/forgot-password">Forgot Password</TextLink>
            }
            rightSide={
              <button
                type="button"
                className="cursor-pointer text-xl text-white/70 disabled:text-white/50 disabled:cursor-not-allowed"
                disabled={submitting}
                onClick={useCallback(() => {
                  setShowPass(!showPass);
                }, [showPass])}>
                {showPass ? <IoEyeSharp /> : <IoEyeOff />}
              </button>
            }
            disabled={submitting || authenticating}
            register={register("password")}
            error={errors.password?.message}
          />
          <Button
            type="submit"
            loading={submitting}
            disabled={submitting || authenticating}>
            Login
          </Button>
          <Separator label="Connections" />
          <Button
            type="button"
            scheme="secondary"
            disabled={submitting || authenticating}
            className="flex justify-center items-center gap-2"
            loading={authenticating}
            onClick={useCallback(async () => {
              setAuthenticating(true);
              await signIn("github");
            }, [])}>
            <FaGithub className="text-lg" />
            <p>Continue with GitHub</p>
          </Button>
          <TextLink href="/auth/sign-up" className="self-center">
            Create an Account
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
