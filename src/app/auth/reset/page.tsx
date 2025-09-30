'use client';
import React from 'react';
import type { FormProps } from 'antd';
import { Button, Form, Input, Card } from 'antd';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';

import {FieldType} from '@/types/form';
import AuthLayout from '../auth-layout';

import '../auth.css';

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Reset Password Failed:', errorInfo);
};
export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    if (values.password !== values.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: values.password })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast.success('Password reset successful! Redirecting to login...');

      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
    } catch (error) {
      console.error('Reset Password Error:', error);
      toast.error('Something went wrong!');
    }
  };
  return (
    <AuthLayout>
      <div className='auth-container'>
        <h2 className='auth-title'>
          Reset Password
        </h2>
        <Card className='auth-card'>
          <Form
            name='reset'
            layout='vertical'
            style={{ maxWidth: 544 }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete='off'
          >
            <Form.Item<FieldType>
              label='Enter new Password'
              name='password'
              rules={[
                { required: true, message: 'Please enter a new password' },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message:
                    'Password must be at least 8 characters long, include uppercase, lowercase, number & special character'
                }
              ]}
            >
              <Input.Password
                placeholder='enter password'
                className='auth-input'
              />
            </Form.Item>

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
                placeholder='confirm password'
                className='auth-input'
              />
            </Form.Item>

            <Form.Item label={null}>
              <Button
                type='primary'
                htmlType='submit'
                className='auth-button'
              >
                Reset Password
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AuthLayout>
  );
}
