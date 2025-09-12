// Resources
import { CredentialsSignin, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./lib/utility";
import bcrypt from "bcryptjs";

// Error Codes
class MissingParams extends CredentialsSignin {
  code = "missing_params";
}
class AccountNotFound extends CredentialsSignin {
  code = "account_not_found";
}
class AccountUsesOAuth extends CredentialsSignin {
  code = "account_uses_oauth";
}
class InvalidPassword extends CredentialsSignin {
  code = "invalid_password";
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

        if (!user) throw new AccountNotFound();

        if (!user.password) throw new AccountUsesOAuth();
        const validPass = await bcrypt.compare(
          String(credentials.password),
          user.password
        );
        if (!validPass) throw new InvalidPassword();

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    signOut: "/",
  },
} satisfies NextAuthConfig;
