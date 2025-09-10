"use client";
// Resources
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Definitions
type LoginFormData = z.infer<typeof loginSchema>;

// Components
import { Button, Input, TextLink } from "@/components/Interaction";
import { Card, Separator, Grid } from "@/components/View";
import Link from "next/link";

// Hooks
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

// Icons
import { FaGithub } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { IoEyeSharp, IoEyeOff } from "react-icons/io5";

// Variables
const loginSchema = z.object({
  email: z
    .email("Not a valid email address.")
    .min(3, "At least 3 characters required."),
  password: z.string().min(8, "The password requires at least 8 characters."),
});

/**
 * The login page to gain access to the dashboard.
 */
export default function Login() {
  // States
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showPass, setShowPass] = useState<boolean>(false);

  // Hooks
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  /**
   * Function that triggers when the login form is submitted.
   */
  const onSubmit = useCallback((data: LoginFormData) => {
    setSubmitting(true);
    console.log(data);
  }, []);

  return (
    <Grid className="flex flex-col justify-center items-center">
      <Card className="w-[90%] sm:w-[70%] md:w-[60%] lg:w-1/2 xl:w-[40%] 2xl:w-[30%]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center w-full">
              <h1 className="font-semibold text-3xl text-white">
                Welcome Back
              </h1>
              <Link href="/" draggable={false}>
                <IoMdClose className="text-white text-3xl p-1 rounded-lg hover:bg-white/10 transition-colors" />
              </Link>
            </div>
            <p className="text-white/70">
              Login to your account to access the dashboard.
            </p>
          </div>
          <Input
            label="Email"
            withAsterix
            placeholder="john@doe.com"
            disabled={submitting}
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
            Login
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
          <TextLink href="/auth/sign-up" className="self-center">
            Create an Account
          </TextLink>
        </form>
      </Card>
      <p className="text-white/50">
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
    </Grid>
  );
}
