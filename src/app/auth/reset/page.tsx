// import AuthLayout from '../layout';
// import AuthForm from '@/components/auth-form';

// export default function SignupPage() {
//   return (
//     <AuthLayout>
//       {/* <h2 className='text-2xl font-bold mb-4 text-center'>Login</h2> */}
//       <AuthForm type='reset' />
//     </AuthLayout>
//   );
// }

'use client';
import React from 'react';
import type { FormProps } from 'antd';
import { Button, Form, Input, Card } from 'antd';
import AuthLayout from '../auth-layout';

type FieldType = {
  password?: string;
  confirmPassword?: string;
};

const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
  console.log('Reset Password Success:', values);
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Reset Password Failed:', errorInfo);
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <div className='flex flex-col items-center justify-center min-h-screen !space-y-8'>
        <h2 className='font-inter font-medium text-[32px] leading-[38px] text-[#007BFF]'>
          Reset Password
        </h2>
        <Card className='[&_.ant-card-body]:!p-0 mobile:[&_.ant-card-body]:!px-4 mobile:[&_.ant-card-body]:!pt-4 tablet:[&_.ant-card-body]:!px-[32px] tablet:[&_.ant-card-body]:!pt-[19px]'>
          <Form
            name='reset'
            layout='vertical'
            style={{ maxWidth: 544 }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete='off'
          >
            {/* New Password */}
            <Form.Item<FieldType>
              label='Enter new Password'
              name='password'
              rules={[{ required: true, message: 'Please enter a new password' }]}
              // labelCol={{
              //   className:
              //     'mobile:!w-[364px] tablet:!w-[544px] font-inter font-normal text-base leading-6'
              // }}
            >
              <Input.Password
                placeholder='enter password'
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
                placeholder='confirm password'
                className='mobile:!w-[364px] tablet:!w-[544px] h-[40px] !px-2 font-inter font-normal text-base leading-6 text-[#6C757D]'
              />
            </Form.Item>

            {/* Submit Button */}
            <Form.Item label={null}>
              <Button
                type='primary'
                htmlType='submit'
                className='mobile:!w-[364px] tablet:!w-[544px] !h-[36px] !px-2 font-inter font-normal text-base leading-6 tracking-normal text-center align-middle'
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
