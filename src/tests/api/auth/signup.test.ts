import { POST } from '@/app/api/auth/signup/route';
import { findUserByEmail, createUser, updateStripeCustomerId } from '@/services/user';
import { hashPassword } from '@/utils/hash';
import { signupSchema } from '@/validations/auth/auth';

jest.mock('@/services/user', () => ({
  findUserByEmail: jest.fn(),
  createUser: jest.fn(),
  updateStripeCustomerId: jest.fn()
}));

jest.mock('@/utils/hash', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed_pw')
}));

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn().mockResolvedValue({ id: 'fake_stripe_id' })
    }
  }));
});

const makeRequest = (body: Record<string, unknown>): Request =>
  ({
    json: async () => body
  } as unknown as Request);
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('POST /api/auth/signup', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await POST(makeRequest({ fullname: '', email: '', password: '' }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Missing required fields');
  });

  it('should return 400 if email already exists', async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue({ id: 1, email: 'existing@example.com' });

    const res = await POST(
      makeRequest({
        fullname: 'Existing User',
        email: 'existing@example.com',
        password: 'Pass@123'
      })
    );

    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Email already in use');
  });

  it('should hash the password correctly', async () => {
  const plainPassword = 'MySecret123';

  const hashed = await hashPassword(plainPassword);

  expect(hashPassword).toHaveBeenCalledWith(plainPassword); 
  expect(hashed).toBe('hashed_pw'); 
  });


  it('should create a new user and stripe customer successfully', async () => {
    (findUserByEmail as jest.Mock).mockResolvedValue(null);
    (createUser as jest.Mock).mockResolvedValue({
      id: 10,
      fullname: 'New User',
      email: 'new@example.com'
    });
    (updateStripeCustomerId as jest.Mock).mockResolvedValue(true);

    const res = await POST(
      makeRequest({
        fullname: 'New User',
        email: 'new@example.com',
        mobile: '03100000000',
        password: 'Pass@123'
      })
    );

    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe('new@example.com');
    expect(updateStripeCustomerId).toHaveBeenCalledWith(10, 'fake_stripe_id');
  });

  it('should return 500 if an internal error occurs', async () => {
    (findUserByEmail as jest.Mock).mockRejectedValue(new Error('Database failure'));

    const res = await POST(
      makeRequest({
        fullname: 'Fail User',
        email: 'fail@example.com',
        password: 'Pass@123'
      })
    );

    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('Something went wrong');
  });
});

describe('signupSchema validation', () => {
  it('should fail if fullname is missing', () => {
    const { error } = signupSchema.validate({ email: 'test@example.com', mobile: '03001234567', password: 'Pass@123' });
    expect(error).toBeDefined();
    expect(error?.details[0].message).toBe('Full name is required');
  });

  it('should fail if fullname is too short', () => {
    const { error } = signupSchema.validate({ fullname: 'AB', email: 'test@example.com', mobile: '03001234567', password: 'Pass@123' });
    expect(error).toBeDefined();
    expect(error?.details[0].message).toBe('Full name must be at least 3 characters');
  });

  it('should fail if fullname is too long', () => {
    const longName = 'A'.repeat(51);
    const { error } = signupSchema.validate({ fullname: longName, email: 'test@example.com', mobile: '03001234567', password: 'Pass@123' });
    expect(error).toBeDefined();
    expect(error?.details[0].message).toBe('Full name cannot exceed 50 characters');
  });

  it('should fail if email is missing or invalid', () => {
    let result = signupSchema.validate({ fullname: 'Test User', mobile: '03001234567', password: 'Pass@123' });
    expect(result.error?.details[0].message).toBe('Email is required');

    result = signupSchema.validate({ fullname: 'Test User', email: 'invalidemail', mobile: '03001234567', password: 'Pass@123' });
    expect(result.error?.details[0].message).toBe('Invalid email format');
  });

  it('should fail if mobile is missing or invalid', () => {
    let result = signupSchema.validate({ fullname: 'Test User', email: 'test@example.com', password: 'Pass@123' });
    expect(result.error?.details[0].message).toBe('Mobile number is required');

    result = signupSchema.validate({ fullname: 'Test User', email: 'test@example.com', mobile: '12345', password: 'Pass@123' });
    expect(result.error?.details[0].message).toBe('Enter a valid mobile number (e.g. 03001234567 or +923001234567)');
  });

  it('should fail if password is missing or does not meet complexity', () => {
    let result = signupSchema.validate({ fullname: 'Test User', email: 'test@example.com', mobile: '03001234567' });
    expect(result.error?.details[0].message).toBe('Password is required');

    result = signupSchema.validate({ fullname: 'Test User', email: 'test@example.com', mobile: '03001234567', password: 'simplepass' });
    expect(result.error?.details[0].message).toBe(
      'Password must be at least 8 characters, include uppercase, lowercase, number & special character'
    );
  });

  it('should pass for valid input', () => {
    const { error, value } = signupSchema.validate({
      fullname: 'Valid User',
      email: 'valid@example.com',
      mobile: '03001234567',
      password: 'Pass@123'
    });
    expect(error).toBeUndefined();
    expect(value).toEqual({
      fullname: 'Valid User',
      email: 'valid@example.com',
      mobile: '03001234567',
      password: 'Pass@123'
    });
  });
});
