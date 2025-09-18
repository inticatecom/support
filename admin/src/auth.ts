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
  code = "Missing required parameters.";
}
class InvalidCredentials extends CredentialsSignin {
  code = "The provided credentials were invalid.";
}
class AccountUsesOAuth extends CredentialsSignin {
  code = "The email provided is already connected using OAuth.";
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

        if (!user) throw new InvalidCredentials();

        if (!user.password) throw new AccountUsesOAuth();
        const validPass = await bcrypt.compare(
          String(credentials.password),
          user.password
        );
        if (!validPass) throw new InvalidCredentials();

        return user;
      },
    }),
    GitHub,
  ],
});
