'use client';

import React from 'react';
import type { FormProps } from 'antd';
import { Button, Form, Input, Card } from 'antd';
import { toast } from 'react-toastify';

import AuthLayout from '../auth-layout';
import {FieldType} from '@/types/form';

import '../auth.css';

const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
  console.log('Signup Success:', values);

  const payload = {
    fullname: values.fullName,
    email: values.email,
    mobile: values.mobile,
    password: values.password
  };

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok) {
      console.log('User created:', data.user);
      toast.success('Signup successful!');
    } else {
      console.error('Signup failed:', data.error);
      toast.error(`Signup failed: ${data.error}`);
    }
  } catch (error) {
    console.error('Signup error:', error);
    toast.error('Something went wrong');
  }
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Signup Failed:', errorInfo);
};

export default function SignupPage() {
  return (
    <AuthLayout>
      <div className='auth-container'>
        <h2 className='auth-title'>
          SignUp
        </h2>
        <Card className='auth-card'>
          <Form
            name='signup'
            layout='vertical'
            style={{ maxWidth: 544 }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete='off'
          >
            {/* Full name */}
            <Form.Item<FieldType>
              label='Fullname'
              name='fullName'
              rules={[
                { required: true, message: 'Please enter your full name!' }
              ]}
            >
              <Input
                placeholder='Fullname'
                className='auth-input'
              />
            </Form.Item>

            {/* Email */}
            <Form.Item<FieldType>
              label='Email address'
              name='email'
              rules={[
                {
                  required: true,
                  message: 'Please enter a valid email address'
                },
                { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' }
              ]}
            >
              <Input
                placeholder='email address'
                className='auth-input'
              />
            </Form.Item>

            {/* Mobile number */}
            <Form.Item<FieldType>
              label='Mobile'
              name='mobile'
              rules={[
                { required: true, message: 'Please enter your mobile number!' },
                {
                  pattern: /^(?:\+92|0)[0-9]{10}$/,
                  message:
                    'Enter a valid mobile number (e.g. 03001234567 or +923001234567)'
                }
              ]}
            >
              <Input
                placeholder='mobile number'
                className='auth-input'
              />
            </Form.Item>

            {/* Password */}
            <Form.Item<FieldType>
              label='Password'
              name='password'
              rules={[
                { required: true, message: 'Please enter a password' },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message:
                    'Password must be at least 8 characters long, include uppercase, lowercase, number & special character'
                }
              ]}
            >
              <Input.Password
                placeholder='Password'
                className='auth-input'
              />
            </Form.Item>

            {/* Confirm Password */}
            <Form.Item<FieldType>
              label='Confirm Password'
              name='confirmPassword'
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: 'Please confirm your password' },
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
                placeholder='Password'
                className='auth-input'
              />
            </Form.Item>

            {/* Submit button */}
            <Form.Item label={null}>
              <Button
                type='primary'
                htmlType='submit'
                className='auth-button'
              >
                SignUp
              </Button>
            </Form.Item>
            <p className='auth-text-spaced'>
              Already have an account!{' '}
              <a
                href='/auth/login'
                className='auth-link'
              >
                Login
              </a>
            </p>
          </Form>
        </Card>
      </div>
    </AuthLayout>
  );
}
