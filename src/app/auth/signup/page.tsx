// import AuthLayout from '../layout';
// import AuthForm from '@/components/auth-form';

// export default function SignupPage() {
//   return (
//     <AuthLayout>
//       {/* <h2 className='text-2xl font-bold mb-4 text-center'>Login</h2> */}
//       <AuthForm type='signup' />
//     </AuthLayout>
//   );
// }

'use client';
import React from 'react';
import type { FormProps } from 'antd';
import { Button, Form, Input, Card } from 'antd';
import AuthLayout from '../auth-layout';
import { toast } from 'react-toastify';

type FieldType = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  mobile?: string;
};

const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
  console.log('Signup Success:', values);

  // Prepare payload for your API
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
      toast.success('Signup successful!');  // or use a toast
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
      <div className='flex flex-col items-center justify-center min-h-screen !space-y-8'>
        <h2 className='font-inter font-medium text-[32px] leading-[38px] text-[#007BFF]'>
          SignUp
        </h2>
        <Card className='[&_.ant-card-body]:!p-0 mobile:[&_.ant-card-body]:!px-4 mobile:[&_.ant-card-body]:!pt-4 tablet:[&_.ant-card-body]:!px-[32px] tablet:[&_.ant-card-body]:!pt-[19px]'>
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
              rules={[{ required: true, message: 'Please enter your full name!' }]}
              // labelCol={{
              //   className:
              //     'mobile:!w-[364px] tablet:!w-[544px] font-inter font-normal text-base leading-6'
              // }}
            >
              <Input
                placeholder='Fullname'
                className='mobile:!w-[364px] tablet:!w-[544px] h-[40px] !px-2 font-inter font-normal text-base leading-6 text-[#6C757D]'
              />
            </Form.Item>

            {/* Email */}
            <Form.Item<FieldType>
              label='Email address'
              name='email'
              rules={[{ required: true, message: 'Please enter a valid email address' }]}
              // labelCol={{
              //   className:
              //     'mobile:w-[364px] tablet:w-[544px] font-inter font-normal text-[16px] leading-6'
              // }}
            >
              <Input
                placeholder='email address'
                className='mobile:!w-[364px] tablet:!w-[544px] h-[40px] !px-2 font-inter font-normal text-base leading-6 text-[#6C757D]'
              />
            </Form.Item>

            {/* Mobile number */}
            <Form.Item<FieldType>
              label='Mobile'
              name='mobile'
              rules={[{ required: true, message: 'Please enter your mobile number!' }]}
              // labelCol={{
              //   className:
              //     'mobile:!w-[364px] tablet:!w-[544px] font-inter font-normal text-base leading-6'
              // }}
            >
              <Input
                placeholder='mobile number'
                className='mobile:!w-[364px] tablet:!w-[544px] h-[40px] !px-2 font-inter font-normal text-base leading-6 text-[#6C757D]'
              />
            </Form.Item>

            {/* Password */}
            <Form.Item<FieldType>
              label='Password'
              name='password'
              rules={[{ required: true, message: 'Please enter a password' }]}
              // labelCol={{
              //   className:
              //     'mobile:!w-[364px] tablet:!w-[544px] font-inter font-normal text-base leading-6'
              // }}
            >
              <Input.Password
                placeholder='Password'
                className='mobile:!w-[364px] tablet:!w-[544px] h-[40px] !px-2 font-inter font-normal text-base leading-6 text-[#6C757D]'
              />
            </Form.Item>

            {/* Confirm Password */}
            <Form.Item<FieldType>
              label='Confirm Password'
              name='confirmPassword'
              rules={[{ required: true, message: 'Please confirm your password' }]}
              // labelCol={{
              //   className:
              //     'mobile:!w-[364px] tablet:!w-[544px] font-inter font-normal text-base leading-6'
              // }}
            >
              <Input.Password
                placeholder='Password'
                className='mobile:!w-[364px] tablet:!w-[544px] h-[40px] !px-2 font-inter font-normal text-base leading-6 text-[#6C757D]'
              />
            </Form.Item>

            {/* Submit button */}
            <Form.Item label={null}>
              <Button
                type='primary'
                htmlType='submit'
                className='mobile:!w-[364px] tablet:!w-[544px] !h-[36px] !px-2 font-inter font-normal text-base leading-6 tracking-normal text-center align-middle'
              >
                SignUp
              </Button>
            </Form.Item>
            <p className='font-inter font-normal text-sm leading-[21px] text-[#5A5F7D] !pb-[32px] !mb-0 text-center'>
                Already have an account!{' '}
                <a href='/auth/login' className='text-[#3C76FF] hover:underline font-inter font-normal text-sm leading-[21px] tracking-normal'>
                  Login
                </a>
              </p>
          </Form>
        </Card>
      </div>
    </AuthLayout>
  );
}
