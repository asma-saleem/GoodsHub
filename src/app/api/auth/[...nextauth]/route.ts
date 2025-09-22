import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { createUser,findUserByEmail } from '@/services/userService';

export const authOptions: NextAuthOptions = {
  providers: [
    // 🔹 Google Login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),

    // 🔹 Email/Password Login
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await findUserByEmail(credentials.email);
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id.toString(),
          name: user.fullname,
          email: user.email
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Only for Google login
      if (account?.provider === 'google' && user?.email) {
        const existingUser = await findUserByEmail(user.email);

        if (!existingUser) {
          // Create new user if not exists
          const newUser = await createUser({
            fullname: user.name || 'No Name',
            email: user.email,
            password: 'google123@'
          });
          user.id = newUser.id.toString();
        } else {
          user.id = existingUser.id.toString();
        }
      }

      return true; // allow sign in
    }
  },

  session: {
    strategy: 'jwt'
  },

  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
