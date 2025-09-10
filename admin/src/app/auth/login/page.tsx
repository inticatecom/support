// Components
import { Button, Input, TextLink } from "@/components/Interaction";
import { Card, Separator, Grid } from "@/components/View";

// Icons
import { FaGithub } from "react-icons/fa";

/**
 * The login page to gain access to the dashboard.
 */
export default function Login() {
  return (
    <Grid className="flex justify-center items-center">
      <Card className="w-1/4">
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-semibold text-3xl text-white">Welcome Back</h1>
            <p className="text-white/70">
              Login to your account to access the dashboard.
            </p>
          </div>
          <Input label="Email" withAsterix placeholder="john@doe.com" />
          <Input
            label="Password"
            type="password"
            withAsterix
            placeholder="super password"
            rightSide={
              <TextLink href="/auth/forgot-password">Forgot Password</TextLink>
            }
          />
          <Button type="submit">Login</Button>
          <Separator label="Connections" />
          <Button
            type="button"
            scheme="secondary"
            className="flex justify-center items-center gap-2">
            <FaGithub className="text-lg" />
            <p>Continue with GitHub</p>
          </Button>
          <TextLink href="/auth/sign-up" className="text-center">
            Create an Account
          </TextLink>
        </form>
      </Card>
    </Grid>
  );
}
