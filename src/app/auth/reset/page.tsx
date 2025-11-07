'use client';
import React, { Suspense, useEffect} from 'react';
import type { FormProps } from 'antd';
import { Button, Form, Input, Card } from 'antd';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import {
  resetPassword,
  resetForgotPasswordState
} from '@/redux/store/slices/auth-slice';
import { FieldType } from '@/types/form';
import AuthLayout from '../auth-layout';
import '../auth.css';


const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Reset Password Failed:', errorInfo);
};

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const dispatch = useAppDispatch();
  const { message, error } = useAppSelector(
    (state) => state.forgotPassword
  );

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    if (!token) {
      toast.error('Invalid or expired reset link.');
      return;
    }

    if (values.password !== values.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    dispatch(resetPassword({ token, password: values.password! }));
  };

  useEffect(() => {
    if (message) {
      toast.success(message);
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
      dispatch(resetForgotPasswordState());
    }

    if (error) {
      if (error === 'Token expired') {
        toast.error('This reset link has expired. Please request a new one.');
        setTimeout(() => {
          window.location.href = '/auth/forgot';
        }, 2000);
      } else {
        toast.error(error);
      }
      dispatch(resetForgotPasswordState());
    }
  }, [message, error, dispatch]);

  return (
    <div className="auth-container">
      <h2 className="auth-title">Reset Password</h2>
      <Card className="auth-card">
        <Form
          name="reset"
          layout="vertical"
          style={{ maxWidth: 544 }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="Enter new Password"
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
              placeholder="Enter a new password e.g. Mypass@123"
              className="auth-input"
            />
          </Form.Item>

          <Form.Item<FieldType>
            label="Confirm Password"
            name="confirmPassword"
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
              placeholder="Confirm your new password e.g. Mypass@123"
              className="auth-input"
            />
          </Form.Item>

          <Form.Item label={null}>
            <Button type="primary" htmlType="submit" className="auth-button">
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div>Loading reset form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
