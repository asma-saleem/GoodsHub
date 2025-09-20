// import NextAuth from 'next-auth';
// import Credentials from 'next-auth/providers/credentials';
// import bcrypt from 'bcryptjs';
// import GoogleProvider from 'next-auth/providers/google';
// import { findUserByEmail } from '@/services/userService';

// const handler = NextAuth({
//   providers: [
//      // 🔹 Google Login
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!
//     }),
//     Credentials({
//       name: 'Credentials',
//       credentials: {
//         email: { label: 'Email', type: 'text' },
//         password: { label: 'Password', type: 'password' }
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null;
//         }
//         const user = await findUserByEmail(credentials.email);

//         if (!user) {
//           return null; 
//         }
//         const isValid = await bcrypt.compare(
//           credentials.password,
//           user.password
//         );

//         if (!isValid) {
//           return null; 
//         }
//         return {
//           id: user.id.toString(),
//           name: user.fullname,
//           email: user.email
//         };
//       }
//     })
//   ],
//   // 🔹 Google user ko DB me check karo
//   callbacks: {
//   async signIn({ user, account }) {
//     if (account?.provider === 'google') {
//       const existingUser = await findUserByEmail(user.email!);
//       if (!existingUser) return false; 
//       user.id = existingUser.id.toString();
//       user.name = existingUser.fullname;
//       user.email = existingUser.email;
//     }
//     return true; 
//   }
// },
//   session: {
//     strategy: 'jwt'
//   },
//   secret: process.env.NEXTAUTH_SECRET
// });

// export { handler as GET, handler as POST };


// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { findUserByEmail } from '@/services/userService';

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

  // callbacks: {
  //   // ✅ Ensure Google user exists in DB
  //   async signIn({ user, account }) {
  //     if (account?.provider === 'google') {
  //       const existingUser = await findUserByEmail(user.email!);
  //       if (!existingUser) {
  //         // ❌ Block login if user is not in DB
  //         return false;
  //       }
  //       // ✅ Map DB values onto session user
  //       user.id = existingUser.id.toString();
  //       user.name = existingUser.fullname;
  //       user.email = existingUser.email;
  //     }
  //     return true;
  //   },

  //   // ✅ Include user.id in JWT token
  //   async jwt({ token, user }) {
  //     if (user) {
  //       token.id = user.id;
  //     }
  //     return token;
  //   },

  //   // ✅ Make id available in session
  //   async session({ session, token }) {
  //     if (token?.id) {
  //       session.user.id = token.id as string;
  //     }
  //     return session;
  //   }
  // },

  session: {
    strategy: 'jwt'
  },

  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
