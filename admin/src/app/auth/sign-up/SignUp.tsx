"use client";
// Resources
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Types
type SignUpData = z.infer<typeof signUpSchema>;

// Hooks
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

// Components
import { Grid, Card, Separator } from "@/components/View";
import { TextLink, Input, Button } from "@/components/Interaction";
import Link from "next/link";

// Icons
import { FaGithub } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

// Variables
const signUpSchema = z.object({
  name: z.string().min(3, "Must be at least 3 characters."),
  email: z.email("Invalid email."),
  password: z.string().min(8, "Must be at least 8 characters."),
});

/**
 * Client component to display the sign-up page interface.
 */
export default function SignUp() {
  // States
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Hooks
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpData>({ resolver: zodResolver(signUpSchema) });

  /**
   * Function that triggers when the login form is submitted.
   */
  const onSubmit = useCallback((data: SignUpData) => {
    setSubmitting(true);
    console.log(data);
  }, []);

  return (
    <Grid className="flex flex-col justify-center items-center">
      <Card className="w-[90%] sm:w-[70%] md:w-[60%] lg:w-1/2 xl:w-[40%] 2xl:w-[30%]">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center w-full">
              <h1 className="font-semibold text-3xl text-white">
                Create Account
              </h1>
              <Link href="/" draggable={false}>
                <IoMdClose className="text-white text-3xl p-1 rounded-lg hover:bg-white/10 transition-colors" />
              </Link>
            </div>
            <p className="text-white/70">
              Create an account with us to access the dashboard.
            </p>
          </div>
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
            type="password"
            withAsterix
            placeholder="super password"
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
          <TextLink href="/auth/login" className="text-center">
            Login to Account
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
