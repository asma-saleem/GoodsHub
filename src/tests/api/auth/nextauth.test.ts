import {
  credentialsAuthorize,
  authOptions
} from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';
import Stripe from 'stripe';
import {
  findUserByEmail,
  createUser,
  updateStripeCustomerId
} from '@/services/user';
import { encode as jwtEncode, decode as jwtDecode } from 'next-auth/jwt';
import type { JWT } from 'next-auth/jwt';
import type { Session, User, Account } from 'next-auth';
import type { AdapterUser } from 'next-auth/adapters';

interface CustomUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  rememberMe?: boolean;
}

interface CustomSession extends Session {
  user: CustomUser;
  maxAge: number;
}

jest.mock('bcryptjs');
jest.mock('stripe');
jest.mock('@/services/user');
jest.mock('next-auth/jwt', () => ({
  encode: jest.fn(),
  decode: jest.fn()
}));

const mockStripeCustomer = { id: 'cus_mock' };

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('NextAuth Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXTAUTH_SECRET = 'test_secret';
  });

  describe('CredentialsProvider.authorize()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (findUserByEmail as jest.Mock).mockResolvedValue({
        id: 1,
        fullname: 'John',
        email: 'john@x.com',
        password: 'hashed',
        role: 'admin'
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    });

    it('returns valid user if credentials correct', async () => {
      const result = await credentialsAuthorize?.(
        { email: 'john@x.com', password: '123', rememberMe: 'true' },
        {} as never
      );

      expect(result).toEqual({
        id: '1',
        name: 'John',
        email: 'john@x.com',
        role: 'admin',
        rememberMe: true
      });
    });

    it('returns null if credentials missing', async () => {
      const result = await credentialsAuthorize(
        undefined as never,
        {} as never
      );
      expect(result).toBeNull();
    });

    it('returns null if user not found', async () => {
      (findUserByEmail as jest.Mock).mockResolvedValue(null);
      const result = await credentialsAuthorize(
        { email: 'no@x.com', password: '123' },
        {} as never
      );
      expect(result).toBeNull();
    });

    it('returns null if password invalid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await credentialsAuthorize(
        { email: 'x@x.com', password: 'wrong' },
        {} as never
      );
      expect(result).toBeNull();
    });
  });

  describe('callbacks.signIn()', () => {
    const signIn = authOptions.callbacks?.signIn;
    const user: Partial<User> = { email: 'new@x.com', name: 'New User' };

    const account: Account = {
      provider: 'google',
      providerAccountId: '12345',
      type: 'oauth',
      access_token: 'mock_access',
      token_type: 'bearer',
      scope: 'email profile',
      expires_at: Math.floor(Date.now() / 1000) + 3600
    };

    it('creates new user if not found (Google)', async () => {
      (findUserByEmail as jest.Mock).mockResolvedValue(null);
      (createUser as jest.Mock).mockResolvedValue({
        id: 2,
        fullname: 'New User',
        email: 'new@x.com'
      });
      (updateStripeCustomerId as jest.Mock).mockResolvedValue({});
      (
        Stripe as unknown as jest.MockedClass<typeof Stripe>
      ).prototype.customers = {
        create: jest.fn().mockResolvedValue(mockStripeCustomer)
      } as unknown as Stripe.CustomersResource;

      let result;
      if (signIn) {
        result = await signIn({
          user: user as User,
          account,
          credentials: {},
          email: {},
          profile: {}
        });
      }
      expect(result).toBe(true);
      expect(createUser).toHaveBeenCalled();
      expect(updateStripeCustomerId).toHaveBeenCalledWith(2, 'cus_mock');
    });
  });

  describe('JWT encode/decode', () => {
    it('encodes and decodes token', async () => {
      (jwtEncode as jest.Mock).mockResolvedValue('encoded-token');
      (jwtDecode as jest.Mock).mockResolvedValue({ email: 'decoded@x.com' });

      const token: JWT = { email: 'x@x.com', exp: 123 };

      const encoded = await authOptions.jwt?.encode?.({
        token,
        secret: 'test_secret',
        maxAge: 3600
      });

      expect(jwtEncode).toHaveBeenCalled();
      expect(encoded).toBe('encoded-token');

      const decoded = await authOptions.jwt?.decode?.({
        token: 'encoded-token',
        secret: 'test_secret'
      });

      expect(jwtDecode).toHaveBeenCalled();
      expect(decoded).toEqual({ email: 'decoded@x.com' });
    });
  });

  describe('callbacks.session()', () => {
    const sessionCb = authOptions.callbacks?.session;

    it('attaches user and expiration details', async () => {
      const baseSession: CustomSession = {
        user: {
          id: '',
          name: '',
          email: '',
          image: '',
          role: '',
          rememberMe: false
        },
        expires: '',
        maxAge: 0
      };

      const token: JWT = {
        sub: '3',
        role: 'admin',
        remember: true,
        exp: Math.floor(Date.now() / 1000) + 3600
      };

      const adapterUser: AdapterUser = {
        id: '3',
        email: 'test@x.com',
        emailVerified: null
      };

      let result;
      if (sessionCb) {
        result = await sessionCb({
          session: baseSession,
          token,
          user: adapterUser,
          newSession: undefined,
          trigger: 'update'
        });
      }

      const session = result as CustomSession;

      expect(session.user.id).toBe('3');
      expect(session.user.role).toBe('admin');
      expect(session.user.rememberMe).toBe(true);
      expect(session.maxAge).toBeGreaterThan(0);
      expect(typeof session.expires).toBe('string');
    });
  });

  it('returns null if rememberMe is not provided', async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue({
      id: 1,
      fullname: 'John',
      email: 'john@x.com',
      password: 'hashed',
      role: 'admin'
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await credentialsAuthorize?.(
      { email: 'john@x.com', password: '123' },
      {} as never
    );

    expect(result).toEqual({
      id: '1',
      name: 'John',
      email: 'john@x.com',
      role: 'admin',
      rememberMe: false 
    });
  });

  it('throws or logs error if findUserByEmail fails', async () => {
    (findUserByEmail as jest.Mock).mockRejectedValue(new Error('DB down'));

    await expect(
      credentialsAuthorize?.(
        { email: 'john@x.com', password: '123' },
        {} as never
      )
    ).rejects.toThrow('DB down');
  });

  it('does not create stripe customer if newUser already has stripeCustomerId', async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue(null);
    (createUser as jest.Mock).mockResolvedValue({
      id: 10,
      fullname: 'Stripe User',
      email: 'stripe@x.com',
      stripeCustomerId: 'existing_cus'
    });

    const account = { provider: 'google' } as Account;
    const user = { email: 'stripe@x.com', name: 'Stripe User' } as User;

    const result = await authOptions.callbacks?.signIn?.({ user, account });

    expect(result).toBe(true);
    expect(updateStripeCustomerId).not.toHaveBeenCalled();
  });
  it('does not overwrite token if trigger is not signIn', async () => {
    const token = {
      sub: '1',
      role: 'admin',
      remember: true,
      exp: 123,
      maxAge: 3600
    };
    const user = { id: '2', role: 'USER', rememberMe: true } as User;

    const result = await authOptions.callbacks?.jwt?.({
      token,
      user,
      trigger: 'update',
      account: null
    });

    expect(result).toEqual(token);
  });

  it('assigns default name if Google user has no name', async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue(null);
    (createUser as jest.Mock).mockResolvedValue({
      id: 20,
      fullname: 'No Name',
      email: 'anon@x.com'
    });

    const account = { provider: 'google' } as Account;
    const user = { email: 'anon@x.com', name: null } as User;

    const result = await authOptions.callbacks?.signIn?.({ user, account });
    expect(result).toBe(true);
    expect(user.name).toBeNull();
  });
  it('does not create user or stripe customer for non-Google providers', async () => {
    const user = { email: 'user@x.com', name: 'User' } as User;
    const account = { provider: 'credentials' } as Account;

    const result = await authOptions.callbacks?.signIn?.({ user, account });
    expect(result).toBe(true);
    expect(createUser).not.toHaveBeenCalled();
    expect(updateStripeCustomerId).not.toHaveBeenCalled();
  });
});
