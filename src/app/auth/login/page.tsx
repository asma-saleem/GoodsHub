'use client';
import React, { useEffect } from 'react';
import type { FormProps } from 'antd';
import { Button, Checkbox, Form, Input, Card } from 'antd';
import AuthLayout from '../auth-layout';
import { signIn, useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/navigation';

import { FieldType } from '@/types/form';
import '../auth.css';
const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Login Failed:', errorInfo);
};

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session?.user?.role) {
      if (session.user.role === 'ADMIN') {
        router.push('/admin/products');
      } else {
        router.push('/');
      }
    }
  }, [session, router]);
  const onFinish = async (values: FieldType) => {
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: values.email?.toLowerCase(),
        password: values.password,
        rememberMe: values.remember ? 'true' : 'false',
        callbackUrl: '/'
      });

      console.log('Login result:', res);

      if (res?.ok) {
        toast.success('Login successful!');
      } else {
        toast.error(
          'Wrong email password, please enter correct credentials'
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Something went wrong, please try again!');
    }
  };
  const handleGoogleLogin = async () => {
    try {
      const res = await signIn('google', {
        redirect: false,
        callbackUrl: '/'
      });

      console.log('Google Login result:', res);

      if (!res?.error) {
        toast.success('Google Login successful!');
      } else {
        toast.error('No account found. Please sign up first');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Something went wrong with Google login!');
    }
  };
  return (
    <AuthLayout>
      <div className='auth-container'>
        <h2 className='auth-title'>
          Login
        </h2>
        <Card className='auth-card'>
          <Form
            name='login'
            layout='vertical'
            style={{ maxWidth: 544 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete='off'
          >
            <Form.Item<FieldType>
              label='Enter email address'
              name='email'
              validateTrigger="onBlur"
              rules={[
                { required: true, message: 'Enter a valid email address' },
                {
                  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address'
                }
              ]}
            >
              <Input
                placeholder='Enter your email e.g. user@gmail.com'
                className='auth-input'
              />
            </Form.Item>

            <Form.Item<FieldType>
              label='Password'
              name='password'
              validateTrigger="onBlur"
              rules={[
                { required: true, message: 'Enter a valid password' },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message:
                    'Password must be at least 8 characters long, include uppercase, lowercase, number & special character'
                }
              ]}
            >
              <Input.Password
                placeholder='Enter your password e.g. User@123'
                className='auth-input'
              />
            </Form.Item>

            <Form.Item<FieldType>
              name='remember'
              valuePropName='checked'
              label={null}
              className='auth-checkbox'
            >
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <Form.Item label={null}>
              <Button
                type='primary'
                htmlType='submit'
                className='auth-button'
              >
                Login
              </Button>
            </Form.Item>
            <div className='auth-div'>
              <p className='auth-text'>
                Forgot Password?{' '}
                <a
                  href='/auth/forgot'
                  className='auth-link'
                >
                  Reset
                </a>
              </p>
              <p className='auth-text-signup'>
                I don’t have an account!{' '}
                <a
                  href='/auth/signup'
                  className='auth-link'
                >
                  SignUp
                </a>
              </p>
            </div>
            <div className='auth-div'>
              <Button
                type='default'
                htmlType='button'
                onClick={handleGoogleLogin}
                className='auth-google-login-button'
              >
                <FcGoogle className='mr-2' size={20} />
                Login with Google
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </AuthLayout>
  );
}
