import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import GoogleProvider from 'next-auth/providers/google';
import { findUserByEmail } from '@/services/userService';

const handler = NextAuth({
  providers: [
     // 🔹 Google Login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await findUserByEmail(credentials.email);

        if (!user) {
          return null; 
        }
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          return null; 
        }
        return {
          id: user.id.toString(),
          name: user.fullname,
          email: user.email
        };
      }
    })
  ],
  // 🔹 Google user ko DB me check karo
  callbacks: {
  async signIn({ user, account }) {
    if (account?.provider === 'google') {
      const existingUser = await findUserByEmail(user.email!);
      if (!existingUser) return false; 
      user.id = existingUser.id.toString();
      user.name = existingUser.fullname;
      user.email = existingUser.email;
    }
    return true; 
  }
},
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST };
