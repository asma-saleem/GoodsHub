import { POST } from '@/app/api/auth/forgot/route';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { updateUser, findUserByEmail } from '@/services/user';

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
});
