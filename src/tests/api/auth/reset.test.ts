import { POST } from '@/app/api/auth/reset/route';
import { findUserByResetToken, updateUserPassword } from '@/services/user';
import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { resetPasswordSchema } from '@/validations/auth/auth';

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

  it('should return 400 if JWT token is invalid', async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new JsonWebTokenError('Invalid token');
    });

    const res = await POST(makeReq({ token: 'invalid', password: 'abc' }));
    expect(res.status).toBe(400);
  });

  it('should return 500 for unexpected errors during token verification', async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('boom');
    });

    const res = await POST(makeReq({ token: 't', password: 'abc' }));
    expect(res.status).toBe(500);
  });
  it('should return 400 if token field is missing in request', async () => {
    const res = await POST(makeReq({ password: 'abc' }));
    expect(res.status).toBe(400);
  });

  it('should return 400 if password field is missing in request', async () => {
    const res = await POST(makeReq({ token: 'valid' }));
    expect(res.status).toBe(400);
  });

  it('should update password successfully if token and user are valid', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ email: 'user@example.com' });
    (findUserByResetToken as jest.Mock).mockResolvedValue({
      email: 'user@example.com'
    });

    const res = await POST(
      makeReq({ token: 'valid', password: 'newpassword' })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe('Password updated successfully');
  });

  it('should call updateUserPassword with correct email and new password', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ email: 'user@example.com' });
    (findUserByResetToken as jest.Mock).mockResolvedValue({
      email: 'user@example.com'
    });

    await POST(makeReq({ token: 'valid', password: 'newpassword' }));
    expect(updateUserPassword).toHaveBeenCalledWith(
      'user@example.com',
      'newpassword'
    );
  });

  it('should return 400 if reset token is invalid or already used', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ email: 'user@example.com' });
    (findUserByResetToken as jest.Mock).mockResolvedValue(null);

    const res = await POST(makeReq({ token: 'used', password: 'abc' }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/Reset link has already been used or expired/i);
  });
});

describe('resetPasswordSchema validation', () => {
  it('should fail if token is missing', () => {
    const { error } = resetPasswordSchema.validate({ password: 'Abcdef1!' });
    expect(error).toBeDefined();
    expect(error?.details[0].message).toBe('Reset token is required');
  });

  it('should fail if password is missing', () => {
    const { error } = resetPasswordSchema.validate({ token: 'validtoken' });
    expect(error).toBeDefined();
    expect(error?.details[0].message).toBe('Password is required');
  });

  it('should fail if password is less than 8 characters', () => {
    const { error } = resetPasswordSchema.validate({
      token: 'validtoken',
      password: 'Ab1!'
    });
    expect(error).toBeDefined();
    expect(error?.details[0].message).toBe(
      'Password must be at least 8 characters'
    );
  });

  it('should fail if password does not meet complexity', () => {
    const { error } = resetPasswordSchema.validate({
      token: 'validtoken',
      password: 'abcdefgh'
    });
    expect(error).toBeDefined();
    expect(error?.details[0].message).toBe(
      'Password must contain uppercase, lowercase, number and special character'
    );
  });

  it('should pass for a valid token and password', () => {
    const { error, value } = resetPasswordSchema.validate({
      token: 'validtoken',
      password: 'Abcd1234!'
    });
    expect(error).toBeUndefined();
    expect(value).toEqual({ token: 'validtoken', password: 'Abcd1234!' });
  });

  it('should fail if password is empty string', () => {
    const { error } = resetPasswordSchema.validate({
      token: 'validtoken',
      password: ''
    });
    expect(error).toBeDefined();
    expect(error?.details[0].message).toBe('Password is required');
  });

  it('should fail if token is empty string', () => {
    const { error } = resetPasswordSchema.validate({
      token: '',
      password: 'Abcd1234!'
    });
    expect(error).toBeDefined();
    expect(error?.details[0].message).toBe('Reset token is required');
  });
});
