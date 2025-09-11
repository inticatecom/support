// Resources
import { CredentialsSignin, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./lib/utility";

// Error Codes
class MissingParams extends CredentialsSignin {
  code = "missing_params";
}
class AccountNotFound extends CredentialsSignin {
  code = "account_not_found";
}

/**
 * Configuration for the authentication library.
 */
export default {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password)
          throw new MissingParams();

        const user = await prisma.user.findUnique({
          where: {
            email: String(credentials.email),
          },
        });

        console.log(user);
        if (!user) throw new AccountNotFound();

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    signOut: "/",
  },
} satisfies NextAuthConfig;
