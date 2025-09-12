'use client';
import React from 'react';
import type { FormProps } from 'antd';
import { Button, Checkbox, Form, Input, Card } from 'antd';

type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
  confirmPassword?: string;
  email?: string;
  fullName?: string;
  mobile?: string;
};

interface AuthFormProps {
  type: 'login' | 'signup' | 'reset' | 'forgot';
}
const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
  console.log('Success:', values);
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

const AuthForm: React.FC<AuthFormProps> = ({ type }) => (
  <div className='flex items-center justify-center min-h-screen'>
    <Card className=' [&_.ant-card-body]:!p-0 mobile:[&_.ant-card-body]:!px-4 mobile:[&_.ant-card-body]:!pt-4 tablet:[&_.ant-card-body]:!px-[32px] tablet:[&_.ant-card-body]:!pt-[19px]'>
      <Form
        name='basic'
        layout='vertical'
        style={{ maxWidth: 544 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete='off'
      >
        {type === 'signup' && (
          <>
            <Form.Item<FieldType>
              label="Fullname"
              name='fullName'
              rules={[
                { required: false, message: 'Please enter your full name!' }
              ]}
              labelCol={{ className: 'mobile:!w-[364px] tablet:!w-[544px] font-inter font-normal text-base leading-6' }}

            >
              <Input
                placeholder='Fullname'
                className='mobile:!w-[364px] tablet:!w-[544px] h-[40px] !px-2 font-inter font-normal text-base leading-6 text-[#6C757D]'
              />
            </Form.Item>

            <Form.Item<FieldType>
              label="Mobile"        
              name='mobile'
              rules={[
                { required: false, message: 'Please enter your mobile number!' }
              ]}
              labelCol={{ className: 'mobile:!w-[364px] tablet:!w-[544px] font-inter font-normal text-base leading-6' }}
            >
              <Input
                placeholder='mobile number'
                className='mobile:!w-[364px] tablet:!w-[544px] h-[40px] !px-2 font-inter font-normal text-base leading-6 text-[#6C757D]'
              />
            </Form.Item>
          </>
        )}
        {(type === 'login' || type === 'signup' || type === 'forgot') && (
          <>
            <Form.Item<FieldType>
              label="Enter email address"
              name='username'
              rules={[
                { required: false, message: 'Enter a valid email address' }
              ]}
              labelCol={{ className: 'mobile:w-[364px] tablet:w-[544px] font-inter font-normal text-[16px] leading-6' }}
            >
              <Input
                placeholder='Please enter your email'
                className='mobile:!w-[364px] tablet:!w-[544px] h-[40px] !px-2 font-inter font-normal text-base leading-6 text-[#6C757D]'
              />
            </Form.Item>
          </>
        )}
        {(type === 'login' || type === 'reset' || type === 'signup') && (
          <>
            <Form.Item<FieldType>
              label="Password"
              name='password'
              rules={[{ required: false, message: 'Enter a valid password' }]}
              labelCol={{ className: 'mobile:!w-[364px] tablet:!w-[544px] font-inter font-normal text-base leading-6' }}
            >
              <Input.Password
                placeholder='Please enter password'
                className='mobile:!w-[364px] tablet:!w-[544px] h-[40px] !px-2 font-inter font-normal text-base leading-6 text-[#6C757D]'
              />
            </Form.Item>
          </>
        )}

        {(type === 'reset' || type === 'signup') && (
          <>
            <Form.Item<FieldType>
              label="Confirm Password"
              name='confirmPassword'
              rules={[
                { required: false, message: 'Please confirm your password!' }
              ]}
              labelCol={{ className: 'mobile:!w-[364px] tablet:!w-[544px] font-inter font-normal text-base leading-6' }}
            >
              <Input.Password
                placeholder='Password'
                className='mobile:!w-[364px] tablet:!w-[544px] h-[40px] !px-2 font-inter font-normal text-base leading-6 text-[#6C757D]'
              />
            </Form.Item>
          </>
        )}

        {type === 'login' && (
          <Form.Item<FieldType>
            name='remember'
            valuePropName='checked'
            label={null}
            className='mobile:!w-[364px] tablet:!w-[544px] h-[40px] !px-2 font-inter font-normal text-[12.8px] leading-[19.2px]'
          >
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
        )}

        <Form.Item label={null}>
          <Button
            type='primary'
            htmlType='submit'
            className='mobile:!w-[364px] tablet:!w-[544px] !h-[36px] !px-2 font-inter font-normal text-base leading-6 tracking-normal text-center align-middle'
          >
            {type === 'login'
              ? 'Login'
              : type === 'signup'
              ? 'SignUp'
              : type === 'forgot'
              ? 'Forgot Password'
              : 'Reset Password'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  </div>
);

export default AuthForm;
