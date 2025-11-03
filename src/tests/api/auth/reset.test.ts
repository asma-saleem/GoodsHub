import { POST } from '@/app/api/auth/reset/route';
import { findUserByResetToken } from '@/services/user';
import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

jest.mock('@/services/user', () => ({
  findUserByResetToken: jest.fn(),
  updateUserPassword: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_pw')
}));

jest.mock('jsonwebtoken', () => {
  const actualJwt = jest.requireActual('jsonwebtoken');
  return {
    ...actualJwt,
    verify: jest.fn()
  };
});

const makeReq = (body: unknown) =>
  ({
    json: async () => body
  } as Request);

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('POST /api/auth/reset-password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
  });

  it('should return 401 if token expired', async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new TokenExpiredError('Token expired', new Date());
    });

    const res = await POST(makeReq({ token: 'expired', password: 'abc' }));
    expect(res.status).toBe(401);
  });

  it('should return 400 if token invalid', async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new JsonWebTokenError('Invalid token');
    });

    const res = await POST(makeReq({ token: 'invalid', password: 'abc' }));
    expect(res.status).toBe(400);
  });

  it('should return 400 if user not found', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ email: 'test@example.com' });
    (findUserByResetToken as jest.Mock).mockResolvedValue(null);

    const res = await POST(makeReq({ token: 't', password: 'abc' }));
    expect(res.status).toBe(400);
  });

  it('should return 500 if unexpected error occurs', async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('boom');
    });

    const res = await POST(makeReq({ token: 't', password: 'abc' }));
    expect(res.status).toBe(500);
  });
});
