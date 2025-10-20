import { decode as jwtDecode, encode as jwtEncode } from 'next-auth/jwt';
import NextAuth, { NextAuthOptions, DefaultUser, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { updateStripeCustomerId } from '@/services/user';
import bcrypt from 'bcryptjs';
import Stripe from 'stripe';

import { createUser, findUserByEmail } from '@/services/user';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

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
            password: ''
            // password: 'google123@'
          });
          if (!newUser.stripeCustomerId) {
              const stripeCustomer = await stripe.customers.create({
                name: newUser.fullname,
                email: newUser.email,
                metadata: { userId: newUser.id }
              });
              await updateStripeCustomerId(newUser.id, stripeCustomer.id);
            }
          user.id = newUser.id.toString();
          user.role = 'USER';
          user.rememberMe = true;
        } else {
          user.id = existingUser.id.toString();
          user.role = existingUser.role;
          user.rememberMe = true;
        }
      }
      return true;
    },

  async jwt({ token, user, trigger }) {
  if (trigger === 'signIn' && user) {
    const now = Math.floor(Date.now() / 1000); 
    const remember = user.rememberMe ?? false;
    const maxAge = remember ? 30 * 24 * 60 * 60 : 60 * 60; 
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
    const remaining = token.exp as number - now; 

    session.exp = token.exp as number; 
    session.maxAge = remaining > 0 ? remaining : 0; 
    session.accessToken = token.accessToken as string;
    session.expires = new Date(token.exp as number * 1000).toISOString(); 
  }
  return session;
}
},
  secret: JWT_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
