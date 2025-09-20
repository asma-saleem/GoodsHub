'use client';
import React from 'react';
import type { FormProps } from 'antd';
import { Button, Checkbox, Form, Input, Card } from 'antd';
import AuthLayout from '../auth-layout';
import { signIn } from 'next-auth/react';
import { toast } from 'react-toastify';

type FieldType = {
  email?: string;
  password?: string;
  remember?: string;
};


const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Login Failed:', errorInfo);
};

export default function LoginPage() {
   const onFinish = async (values: FieldType) => {
    try {
      const res = await signIn('credentials', {
        redirect: false, 
        email: values.email,
        password: values.password,
        callbackUrl: '/'
      });

      console.log('Login result:', res);

      if (res?.ok) {
        toast.success('Login successful!');
        setTimeout(() => {
         window.location.href = res.url || '/';
        }, 2000);
      } else {
        toast.error('Wrong username password, please enter correct credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Something went wrong, please try again!'); 
    }
  };
   // 🔹 Google Login
const handleGoogleLogin = async () => {
  try {
    const res = await signIn('google', {
      redirect: false, 
      callbackUrl: '/'
    });

    console.log('Google Login result:', res);

    if (res && !res.error) {
      toast.success('Google Login successful!');
      // setTimeout(() => {
      //   window.location.href = res.url || '/';
      // }, 10000);
    } else {
      toast.error('No account found. Please sign up first.');
    }
  } catch (error) {
    console.error('Google login error:', error);
    toast.error('Something went wrong with Google login!');
  }
};
  return (
    <AuthLayout>
      <div className='flex flex-col items-center justify-center min-h-screen space-y-8'>
        <h2 className='font-inter font-medium text-[32px] leading-[38px] text-[#007BFF]'>
          Login
        </h2>
        <Card className='[&_.ant-card-body]:!p-0 mobile:[&_.ant-card-body]:!p-4 tablet:[&_.ant-card-body]:!p-[32px]'>
          <Form
            name='login'
            layout='vertical'
            style={{ maxWidth: 544 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete='off'
          >
            {/* Email */}
            <Form.Item<FieldType>
              label='Enter email address'
              name='email'
              rules={[
                { required: true, message: 'Enter a valid email address' },
                { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' }
              ]}
            >
              <Input
                placeholder='Please enter your email'
                className='mobile:!w-[364px] tablet:!w-[544px] h-[40px] !px-2 font-inter font-normal text-base leading-6 text-[#6C757D]'
              />
            </Form.Item>

            {/* Password */}
            <Form.Item<FieldType>
              label='Password'
              name='password'
              rules={[{ required: true, message: 'Enter a valid password' },
                { 
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
                    message: 'Password must be at least 8 characters long, include uppercase, lowercase, number & special character'
                }
              ]}
            >
              <Input.Password
                placeholder='Please enter password'
                className='mobile:!w-[364px] tablet:!w-[544px] h-[40px] !px-2 font-inter font-normal text-base leading-6 text-[#6C757D]'
              />
            </Form.Item>

            <Form.Item<FieldType>
              name='remember'
              valuePropName='checked'
              label={null}
              className='mobile:!w-[364px] tablet:!w-[544px] h-[40px] !px-2 font-inter font-normal text-[12.8px] leading-[19.2px]'
            >
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <Form.Item label={null}>
              <Button
                type='primary'
                htmlType='submit'
                className='mobile:!w-[364px] tablet:!w-[544px] !h-[36px] !px-2 font-inter font-normal text-base leading-6 tracking-normal text-center align-middle'
              >
                Login
              </Button>
            </Form.Item>
            <div className='text-center !space-y-6'>
              <p className='font-inter font-normal text-sm leading-[21px] text-[#5A5F7D]'>
                Forgot Password?{' '}
                <a href='/auth/reset' className='text-[#3C76FF] hover:underline font-inter font-normal text-sm leading-[21px] tracking-normal'>
                  Reset
                </a>
              </p>
              <p className='font-inter font-normal text-sm leading-[21px] text-[#5A5F7D] !pb-[16px] !mb-0'>
                I don’t have an account!{' '}
                <a href='/auth/signup' className='text-[#3C76FF] hover:underline font-inter font-normal text-sm leading-[21px] tracking-normal'>
                  SignUp
                </a>
              </p>
            </div>
            <div className='text-center !space-y-6'>
            <button
             onClick={handleGoogleLogin}
             className="bg-blue-500 text-white px-4 py-2 rounded"
              >
             Sign in with Google
            </button>
          </div>

          </Form>
        </Card>
      </div>
    </AuthLayout>
  );
}


