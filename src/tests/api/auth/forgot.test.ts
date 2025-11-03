import { POST } from '@/app/api/auth/forgot/route';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { updateUser, findUserByEmail } from '@/services/user';
import { forgotPasswordSchema } from '@/validations/auth/auth';

jest.mock('nodemailer');
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));
jest.mock('@/services/user', () => ({
  findUserByEmail: jest.fn(),
  updateUser: jest.fn()
}));

const makeReq = (body: unknown) =>
  ({
    json: async () => body
  } as Request);
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('POST /api/auth/forgot', () => {
  const mockSendMail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail
    });
  });

  it('should return 404 if user does not exist', async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue(null);

    const res = await POST(makeReq({ email: 'notfound@example.com' }));
    const data = await res.json();

    expect(findUserByEmail).toHaveBeenCalledWith('notfound@example.com');
    expect(res.status).toBe(404);
    expect(data.message).toMatch(/password reset link has been sent/i);
  });

  it('should send reset email and return success if user exists', async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue({
      email: 'user@example.com'
    });
    (jwt.sign as jest.Mock).mockReturnValue('mock_token');

    const res = await POST(makeReq({ email: 'user@example.com' }));
    const data = await res.json();

    expect(jwt.sign).toHaveBeenCalledWith(
      { email: 'user@example.com' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );
    expect(updateUser).toHaveBeenCalledWith(
      'user@example.com',
      'mock_token',
      expect.any(Date)
    );
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Reset your password',
        html: expect.stringContaining('Reset your password')
      })
    );
    expect(res.status).toBe(200);
    expect(data.message).toMatch(/password reset link has been sent/i);
  });

  it('should return 500 if unexpected error occurs', async () => {
    (findUserByEmail as jest.Mock).mockRejectedValue(new Error('DB down'));

    const res = await POST(makeReq({ email: 'user@example.com' }));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.message).toBe('Internal server error');
  });

  it('should correctly format the reset URL in the email', async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue({
      email: 'user@example.com'
    });
    (jwt.sign as jest.Mock).mockReturnValue('mock_token');

    await POST(makeReq({ email: 'user@example.com' }));

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining(
          `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset?token=mock_token`
        )
      })
    );
  });
  it('should generate a unique token for each request', async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue({
      email: 'user@example.com'
    });

    (jwt.sign as jest.Mock)
      .mockReturnValueOnce('token1')
      .mockReturnValueOnce('token2');

    await POST(makeReq({ email: 'user@example.com' }));
    await POST(makeReq({ email: 'user@example.com' }));

    expect(jwt.sign).toHaveBeenNthCalledWith(
      1,
      { email: 'user@example.com' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );
    expect(jwt.sign).toHaveBeenNthCalledWith(
      2,
      { email: 'user@example.com' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );
  });

  it('should set the correct token expiry', async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue({
      email: 'user@example.com'
    });
    (jwt.sign as jest.Mock).mockReturnValue('mock_token');

    const before = new Date();
    await POST(makeReq({ email: 'user@example.com' }));
    const after = new Date();

    const expiry = (updateUser as jest.Mock).mock.calls[0][2];
    expect(expiry.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(expiry.getTime()).toBeLessThanOrEqual(
      after.getTime() + 10 * 60 * 1000
    );
  });

  it('should return 500 if sending email fails', async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue({
      email: 'user@example.com'
    });
    (jwt.sign as jest.Mock).mockReturnValue('mock_token');
    const mockSendMail = jest.fn().mockRejectedValue(new Error('SMTP failed'));
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail
    });

    const res = await POST(makeReq({ email: 'user@example.com' }));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.message).toBe('Internal server error');
  });

  it('should handle uppercase emails', async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue({
      email: 'user@example.com'
    });
    (jwt.sign as jest.Mock).mockReturnValue('mock_token');

    const res = await POST(makeReq({ email: 'USER@EXAMPLE.COM' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toMatch(/password reset link has been sent/i);
  });
});

describe('forgotPasswordSchema validation', () => {
  it('should fail if email is missing', () => {
    const { error } = forgotPasswordSchema.validate({});
    expect(error).toBeDefined();
    expect(error?.details[0].message).toBe('Email is required');
  });

  it('should fail if email is empty string', () => {
    const { error } = forgotPasswordSchema.validate({ email: '' });
    expect(error).toBeDefined();
    expect(error?.details[0].message).toBe('Email is required');
  });

  it('should fail if email format is invalid', () => {
    const { error } = forgotPasswordSchema.validate({ email: 'invalidemail' });
    expect(error).toBeDefined();
    expect(error?.details[0].message).toBe('Invalid email format');
  });

  it('should pass if email is valid', () => {
    const { error, value } = forgotPasswordSchema.validate({
      email: 'user@example.com'
    });
    expect(error).toBeUndefined();
    expect(value).toEqual({ email: 'user@example.com' });
  });
});
