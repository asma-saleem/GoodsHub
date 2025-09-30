// import NextAuth, { NextAuthOptions, DefaultUser, DefaultSession } from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import GoogleProvider from 'next-auth/providers/google';
// import bcrypt from 'bcryptjs';
// import { createUser,findUserByEmail } from '@/services/user';
// declare module 'next-auth' {
//   interface User extends DefaultUser {
//     role?: string;
//   }
//     interface Session {
//     user: {
//       id: string;
//       role?: string;
//     } & DefaultSession['user'];
//   }
// }
// export const authOptions: NextAuthOptions = {
//   providers: [
//     // 🔹 Google Login
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!
//     }),

//     // 🔹 Email/Password Login
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         email: { label: 'Email', type: 'text' },
//         password: { label: 'Password', type: 'password' }
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) return null;

//         const user = await findUserByEmail(credentials.email);
//         if (!user) return null;

//         const isValid = await bcrypt.compare(credentials.password, user.password);
//         if (!isValid) return null;

//         return {
//           id: user.id.toString(),
//           name: user.fullname,
//           email: user.email,
//           role: user.role || 'user'
//         };
//       }
//     })
//   ],
//   callbacks: {
//     async signIn({ user, account }) {
//       // Only for Google login
//       if (account?.provider === 'google' && user?.email) {
//         const existingUser = await findUserByEmail(user.email);

//         if (!existingUser) {
//           // Create new user if not exists
//           const newUser = await createUser({
//             fullname: user.name || 'No Name',
//             email: user.email,
//             password: 'google123@'
//           });
//           user.id = newUser.id.toString();
//           user.role = 'user';
//         } else {
//           user.id = existingUser.id.toString();
//           user.role = existingUser.role;
//         }
//       }

//       return true;
//     },
//   async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.role = user.role;
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.id as string;
//         session.user.role = token.role as string; 
//       }
//       return session;
//     }
//   },

//   session: {
//     strategy: 'jwt'
//   },

//   secret: process.env.NEXTAUTH_SECRET
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };
///////version 2
// import NextAuth, { NextAuthOptions, DefaultUser, DefaultSession } from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import GoogleProvider from 'next-auth/providers/google';
// import bcrypt from 'bcryptjs';
// import { createUser, findUserByEmail } from '@/services/user';

// // Extend NextAuth types
// declare module 'next-auth' {
//   interface User extends DefaultUser {
//     role?: string;
//     rememberMe?: boolean;
//   }

//   interface Session {
//     accessToken?: string;
//     exp?: string;
//     maxAge:number;
//     user: {
//       id: string;
//       role?: string;
//       rememberMe?: boolean;
//     } & DefaultSession['user'];
//   }
// }

// export const authOptions: NextAuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!
//     }),
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         email: { label: 'Email', type: 'text' },
//         password: { label: 'Password', type: 'password' },
//         rememberMe: { label: 'Remember Me', type: 'text' }
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) return null;

//         const user = await findUserByEmail(credentials.email);
//         if (!user) return null;

//         const isValid = await bcrypt.compare(credentials.password, user.password);
//         if (!isValid) return null;

//         return {
//           id: user.id.toString(),
//           name: user.fullname,
//           email: user.email,
//           role: user.role || 'user',
//           rememberMe: credentials.rememberMe === 'true'
//         };
//       }
//     })
//   ],

//   session: {
//     strategy: 'jwt', // <-- ensure JWT is used
//     maxAge: 60// max 1 minute
//   },

//   callbacks: {
//     async signIn({ user, account }) {
//       if (account?.provider === 'google' && user?.email) {
//         const existingUser = await findUserByEmail(user.email);

//         if (!existingUser) {
//           const newUser = await createUser({
//             fullname: user.name || 'No Name',
//             email: user.email,
//             password: 'google123@'
//           });
//           user.id = newUser.id.toString();
//           user.role = 'user';
//         } else {
//           user.id = existingUser.id.toString();
//           user.role = existingUser.role;
//         }
//       }

//       return true;
//     },

//     async jwt({ token, user, trigger }) {
//   if (trigger === 'signIn' && user) {
//     const now = new Date();
//     const remember = user.rememberMe ?? false;

//     // Compute expiration
//     const expires = new Date(now.getTime() + (remember ? 30 * 24 * 60 * 60 * 1000 : 60 * 1000));
//     token.exp = expires.toISOString(); // store as ISO string
//     token.role = user.role;
//     token.remember = remember;
//     token.maxAge = remember ? 30 * 24 * 60 * 60 : 60;
//   }
//   return token;
// },

// async session({ session, token }) {
//   if (!token.sub) throw new Error('Token missing sub');

//   session.user.id = token.sub as string;
//   session.user.name = session.user.name || (token.name as string | undefined);
//   session.user.email = session.user.email || (token.email as string | undefined);
//   session.user.role = token.role as string | undefined;
//   session.user.rememberMe = token.remember as boolean | undefined;
//   session.maxAge = token.maxAge as number;

//   // Safely convert ISO string to timestamp in seconds
//   session.exp = token.exp as string | undefined; // no conversion to number
//   return session;
// }

//   },

//   secret: process.env.NEXTAUTH_SECRET
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

///////version 3
// import NextAuth, { NextAuthOptions, DefaultUser, DefaultSession } from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import GoogleProvider from 'next-auth/providers/google';
// import bcrypt from 'bcryptjs';
// import { createUser, findUserByEmail } from '@/services/user';
// import jwt from 'jsonwebtoken';

// // Extend NextAuth types
// declare module 'next-auth' {
//   interface User extends DefaultUser {
//     role?: string;
//     rememberMe?: boolean;
//   }

//   interface Session {
//     accessToken?: string;
//     exp?: number;
//     maxAge: number;
//     user: {
//       id: string;
//       role?: string;
//       rememberMe?: boolean;
//     } & DefaultSession['user'];
//   }
// }

// // Ensure NEXTAUTH_SECRET is defined
// const JWT_SECRET = process.env.NEXTAUTH_SECRET;
// if (!JWT_SECRET) throw new Error('NEXTAUTH_SECRET is not defined');

// export const authOptions: NextAuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!
//     }),

//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         email: { label: 'Email', type: 'text' },
//         password: { label: 'Password', type: 'password' },
//         rememberMe: { label: 'Remember Me', type: 'text' }
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) return null;

//         const user = await findUserByEmail(credentials.email);
//         if (!user) return null;

//         const isValid = await bcrypt.compare(credentials.password, user.password);
//         if (!isValid) return null;

//         return {
//           id: user.id.toString(),
//           name: user.fullname,
//           email: user.email,
//           role: user.role || 'user',
//           rememberMe: credentials.rememberMe === 'true'
//         };
//       }
//     })
//   ],

//   session: {
//     strategy: 'jwt'
//   },

//   callbacks: {
//     async signIn({ user, account }) {
//       if (account?.provider === 'google' && user?.email) {
//         const existingUser = await findUserByEmail(user.email);

//         if (!existingUser) {
//           const newUser = await createUser({
//             fullname: user.name || 'No Name',
//             email: user.email,
//             password: 'google123@'
//           });
//           user.id = newUser.id.toString();
//           user.role = 'user';
//         } else {
//           user.id = existingUser.id.toString();
//           user.role = existingUser.role;
//         }
//       }

//       return true;
//     },

//     async jwt({ token, user, trigger }) {
//       if (trigger === 'signIn' && user) {
//         const now = Math.floor(Date.now() / 1000);
//         const remember = user.rememberMe ?? false;

//         // Expiration: 1 minute or 30 days
//         const exp = now + (remember ? 30 * 24 * 60 * 60 : 60);

//         // Encode token
//         const encoded = jwt.sign(
//           {
//             sub: user.id,
//             role: user.role,
//             remember,
//             exp
//           },
//           JWT_SECRET as string
//         );

//         token.accessToken = encoded;
//         token.sub = user.id;
//         token.role = user.role;
//         token.remember = remember;
//         token.exp = exp;
//         token.maxAge = remember ? 30 * 24 * 60 * 60 : 60; // in seconds
//       }

//       return token;
//     },

//     async session({ session, token }) {
//       if (!token.accessToken) throw new Error('Token missing');

//       // Decode JWT safely
//       const decoded = jwt.verify(token.accessToken as string, JWT_SECRET as string) as {
//         sub: string;
//         role?: string;
//         remember?: boolean;
//         exp: number;
//       };

//       session.user.id = decoded.sub;
//       session.user.role = decoded.role;
//       session.user.rememberMe = decoded.remember;
//       session.exp = decoded.exp;
//         session.maxAge = (token.maxAge as number) ?? (decoded.remember ? 30 * 24 * 60 * 60 : 60);
//   session.accessToken = token.accessToken as string;

//       return session;
//     }
//   },

//   secret: JWT_SECRET
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };



import { decode as jwtDecode, encode as jwtEncode } from 'next-auth/jwt';
import NextAuth, { NextAuthOptions, DefaultUser, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail } from '@/services/user';

declare module 'next-auth' {
  interface User extends DefaultUser {
    role?: string;
    rememberMe?: boolean;
  }

  interface Session {
    accessToken?: string;
    exp?: number;
    maxAge: number;
    user: {
      id: string;
      role?: string;
      rememberMe?: boolean;
    } & DefaultSession['user'];
  }
}

const JWT_SECRET = process.env.NEXTAUTH_SECRET;
if (!JWT_SECRET) throw new Error('NEXTAUTH_SECRET is not defined');

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),

    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'text' }
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
          email: user.email,
          role: user.role || 'user',
          rememberMe: credentials.rememberMe === 'true'
        };
      }
    })
  ],

  session: {
    strategy: 'jwt'
  },
  jwt: {
    async encode ({token, secret, maxAge}) {
      if (!token) return '';
      const maxAgeNew = token.exp 
      ? token.exp as number - Math.floor(Date.now() /1000) 
      : maxAge;

      return jwtEncode({token,secret,maxAge: maxAgeNew});
    },
    async decode({token, secret}) {
      return jwtDecode({token, secret});
    }
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user?.email) {
        const existingUser = await findUserByEmail(user.email);
        if (!existingUser) {
          const newUser = await createUser({
            fullname: user.name || 'No Name',
            email: user.email,
            password: 'google123@'
          });
          user.id = newUser.id.toString();
          user.role = 'user';
        } else {
          user.id = existingUser.id.toString();
          user.role = existingUser.role;
        }
      }
      return true;
    },

  async jwt({ token, user, trigger }) {
  if (trigger === 'signIn' && user) {
    const now = Math.floor(Date.now() / 1000); // current time in seconds
    const remember = user.rememberMe ?? false;
    const maxAge = remember ? 30 * 24 * 60 * 60 : 60; // 30 days or 1 minute
    const exp = now + maxAge;

    token.sub = user.id;
    token.role = user.role;
    token.remember = remember;
    token.exp = exp;
    token.maxAge = maxAge;
  }
  return token;
},


async session({ session, token }) {
  if (token)
  {
    session.user.id = token.sub as string;
    session.user.role = token.role as string | undefined;;
    session.user.rememberMe = token.remember as boolean | undefined;;

    const now = Math.floor(Date.now() / 1000);
    const remaining = token.exp as number - now; // remaining seconds until expiry

    session.exp = token.exp as number; // absolute timestamp
    session.maxAge = remaining > 0 ? remaining : 0; // correct remaining seconds
    session.accessToken = token.accessToken as string;
    session.expires = new Date(token.exp as number * 1000).toISOString(); // proper ISO string
  }

  return session;
}

},

  secret: JWT_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
