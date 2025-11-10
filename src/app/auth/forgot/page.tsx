'use client';

import React, { useEffect } from 'react';
import type { FormProps } from 'antd';
import { Button, Form, Input, Card } from 'antd';
import AuthLayout from '../auth-layout';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import {
  sendForgotPasswordEmail,
  resetForgotPasswordState
} from '@/redux/store/slices/auth-slice';

import { FieldType } from '@/types/form';
import '../auth.css';

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();

  const { message, error } = useAppSelector((state) => state.auth);

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    dispatch(sendForgotPasswordEmail(values.email!.toLowerCase()));
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (
    errorInfo
  ) => {
    console.log('Forgot Password Failed:', errorInfo);
  };

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(resetForgotPasswordState());
    }
    if (error) {
      toast.error(error);
      dispatch(resetForgotPasswordState());
    }
  }, [message, error, dispatch]);
  return (
    <AuthLayout>
      <div className="auth-container-spaced">
        <h2 className="auth-title">Forgot Password</h2>
        <Card className="auth-card">
          <Form
            name="forgot"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item<FieldType>
              label="Enter email address"
              name="email"
              validateTrigger="onBlur"
              rules={[
                { required: true, message: 'Enter your email' },
                {
                  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address'
                }
              ]}
            >
              <Input
                placeholder="Enter your email e.g. user@gmail.com"
                className="mobile:!w-[364px] tablet:!w-[544px] h-[40px] !px-2 font-inter font-normal text-base leading-6 text-[#6C757D]"
              />
            </Form.Item>
            <Form.Item label={null}>
              <Button type="primary" htmlType="submit" className="auth-button">
                Forgot Password
              </Button>
            </Form.Item>
            <p className="auth-text-spaced">
              No, I remember my password{' '}
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
