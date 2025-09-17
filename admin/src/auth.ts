// Resources
import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/utility";
import bcrypt from "bcryptjs";

// Providers
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

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
 * Resources to interact with the authentication library.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    signOut: "/",
  },
  callbacks: {
    jwt: ({ token, user }) => {
      return {
        ...token,
        ...(user && { id: user.id }),
      };
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: String(token.id),
        },
      };
    },
  },
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
    GitHub,
  ],
});
