import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { findUserByEmail } from '@/services/userService';

const handler = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      // async authorize(credentials) {
      //   // 🔹 Dummy user (No DB for now)
      //   const user = {
      //     id: '1',
      //     name: 'Asma',
      //     email: 'asma@example.com',
      //     password: '123456'
      //   };

      //   if (
      //     credentials?.email === user.email &&
      //     credentials?.password === user.password
      //   ) {
      //     return user;
      //   }
      //   return null;
      // }
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
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST };
