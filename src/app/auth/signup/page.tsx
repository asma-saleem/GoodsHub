'use client';

import React, { useEffect } from 'react';
import type { FormProps } from 'antd';
import { Button, Form, Input, Card } from 'antd';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

import AuthLayout from '../auth-layout';
import { FieldType } from '@/types/form';
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { signupUser } from '@/redux/store/slices/auth-slice';
import '../auth.css';
export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { message, error } = useAppSelector((state) => state.auth);

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    const payload = {
      fullname: values.fullName as string,
      email: values.email as string,
      mobile: values.mobile,
      password: values.password as string
    };
    dispatch(signupUser(payload));
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (
    errorInfo
  ) => {
    console.log('Signup Failed:', errorInfo);
  };

  useEffect(() => {
    if (message) {
      toast.success(message);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    }
    if (error) {
      toast.error(error);
    }
  }, [message, error, router, dispatch]);

  return (
    <AuthLayout>
      <div className="auth-container">
        <h2 className="auth-title">SignUp</h2>
        <Card className="auth-card">
          <Form
            name="signup"
            layout="vertical"
            style={{ maxWidth: 544 }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item<FieldType>
              label="Fullname"
              name="fullName"
              validateTrigger="onBlur"
              rules={[
                { required: true, message: 'Enter your full name' },
                {
                  pattern: /^[a-zA-Z\s]+$/,
                  message: 'Full name can only contain letters and spaces!'
                },
                {
                  min: 3,
                  message: 'Full name must be at least 3 characters long'
                }
              ]}
            >
              <Input
                placeholder="Enter your full name e.g. Asma Saleem"
                className="auth-input"
              />
            </Form.Item>
            <Form.Item<FieldType>
              label="Email address"
              name="email"
              validateTrigger="onBlur"
              rules={[
                {
                  required: true,
                  message: 'Enter a valid email address'
                },
                {
                  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address'
                }
              ]}
            >
              <Input
                placeholder="Enter email address e.g. user@gmail.com"
                className="auth-input"
              />
            </Form.Item>
            <Form.Item<FieldType>
              label="Mobile"
              name="mobile"
              validateTrigger="onBlur"
              rules={[
                { required: true, message: 'Enter a valid mobile number' },
                {
                  pattern: /^(?:\+92|0)[0-9]{10}$/,
                  message: 'Enter a valid mobile number'
                }
              ]}
            >
              <Input
                placeholder="Enter your number e.g. 03001234567 or +923001234567"
                className="auth-input"
              />
            </Form.Item>
            <Form.Item<FieldType>
              label="Password"
              name="password"
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
                placeholder="Enter your password e.g. User@123"
                className="auth-input"
              />
            </Form.Item>
            <Form.Item<FieldType>
              label="Confirm Password"
              name="confirmPassword"
              validateTrigger="onBlur"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: 'Confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match!'));
                  }
                })
              ]}
            >
              <Input.Password
                placeholder="Enter your password again e.g. User@123"
                className="auth-input"
              />
            </Form.Item>
            <Form.Item label={null}>
              <Button type="primary" htmlType="submit" className="auth-button">
                SignUp
              </Button>
            </Form.Item>
            <p className="auth-text-spaced">
              Already have an account!{' '}
              <a href="/auth/login" className="auth-link">
                Login
              </a>
            </p>
          </Form>
        </Card>
      </div>
    </AuthLayout>
  );
}
