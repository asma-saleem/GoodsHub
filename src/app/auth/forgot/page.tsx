// import AuthLayout from '../layout';
// import AuthForm from '@/components/auth-form';

// export default function SignupPage() {
//   return (
//     <AuthLayout>
//       {/* <h2 className='text-2xl font-bold mb-4 text-center'>Login</h2> */}
//       <AuthForm type='forgot' />
//     </AuthLayout>
//   );
// }

'use client';
import React from 'react';
import type { FormProps } from 'antd';
import { Button, Form, Input, Card } from 'antd';
import AuthLayout from '../auth-layout';


type FieldType = {
  username?: string;
};

const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
  console.log('Forgot Password Request:', values);
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Forgot Password Failed:', errorInfo);
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <div className='flex !mx-4 flex-col items-center justify-center min-h-screen !space-y-8 w-full'>
        <h2 className='font-inter font-medium text-[32px] leading-[38px] text-[#007BFF]'>
          Forgot Password
        </h2>
        {/* <Card className='[&_.ant-card-body]:!p-0 mobile:[&_.ant-card-body]:!px-4 mobile:[&_.ant-card-body]:!pt-4 tablet:[&_.ant-card-body]:!px-[32px] tablet:[&_.ant-card-body]:!pt-[19px]'> */}
         <Card className='[&_.ant-card-body]:!p-0 mobile:[&_.ant-card-body]:!px-4 mobile:[&_.ant-card-body]:!pt-4 tablet:[&_.ant-card-body]:!px-[32px] tablet:[&_.ant-card-body]:!pt-[19px]'>
          <Form
            name='forgot'
            layout='vertical'
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete='off'
          >
            {/* Email address */}
            <Form.Item<FieldType>
              label='Enter email address'
              name='username'
              rules={[{ required: true, message: 'Please enter your email' }]}
              // labelCol={{
              //   className:
              //     'mobile:!w-[364px] tablet:!w-[544px] font-inter font-normal text-[16px] leading-6'
              // }}
            >
              <Input
                placeholder='Please enter your email'
                className='w-full !px-2 font-inter font-normal text-base leading-6 text-[#6C757D]'
              />
            </Form.Item>

            {/* Submit button */}
            <Form.Item label={null}>
              <Button
                type='primary'
                htmlType='submit'
                className='!mt-2 w-full !px-2 font-inter font-normal text-base leading-6 tracking-normal text-center align-middle'
              >
                Forgot Password
              </Button>
            </Form.Item>
            <p className='font-inter font-normal text-sm leading-[21px] text-[#5A5F7D] !mb-0 text-center'>
                No, I remember my password{' '}
                <a href='/auth/login' className='text-[#3C76FF] hover:underline font-inter font-normal text-sm leading-[21px] tracking-normal'>
                  Login
                </a>
              </p>
          </Form>
        {/* </Card> */}
        </Card> 
      </div>
    </AuthLayout>
  );
}




