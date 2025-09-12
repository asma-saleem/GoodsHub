// import AuthLayout from '../layout';
// import AuthForm from '@/components/auth-form';

// export default function LoginPage() {
//   return (
//     <AuthLayout>
//       {/* <h2 className='text-2xl font-bold mb-4 text-center'>Login</h2> */}
//       <AuthForm type='login' />
//     </AuthLayout>
//   );
// }

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

// const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
//   console.log('Login Success:', values);
// };

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Login Failed:', errorInfo);
};

export default function LoginPage() {
   const onFinish = async (values: FieldType) => {
    try {
      const res = await signIn('credentials', {
        redirect: false, // ⚡ keep it false to handle success/error yourself
        email: values.email,
        password: values.password,
        callbackUrl: '/'
      });

      console.log('Login result:', res);

      if (res?.ok) {
        toast.success('✅ Login successful!');
        setTimeout(() => {
         window.location.href = res.url || '/';
        }, 2000);
      } else {
        toast.error('Wrong username password, please enter correct credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('⚠️ Something went wrong, please try again!'); //Network Error
    }
  };
  return (
    <AuthLayout>
      <div className='flex flex-col items-center justify-center min-h-screen space-y-8'>
        <h2 className='font-inter font-medium text-[32px] leading-[38px] text-[#007BFF]'>
          Login
        </h2>
        <Card className='[&_.ant-card-body]:!p-0 mobile:[&_.ant-card-body]:!px-4 mobile:[&_.ant-card-body]:!pt-4 tablet:[&_.ant-card-body]:!px-[32px] tablet:[&_.ant-card-body]:!pt-[19px]'>
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
                { required: true, message: 'Enter a valid email address' }
              ]}
              // labelCol={{
              //   className:
              //     'mobile:w-[364px] tablet:w-[544px] font-inter font-normal text-[16px] leading-6'
              // }}
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
              rules={[{ required: true, message: 'Enter a valid password' }]}
              // labelCol={{
              //   className:
              //     'mobile:!w-[364px] tablet:!w-[544px] font-inter font-normal text-base leading-6'
              // }}
            >
              <Input.Password
                placeholder='Please enter password'
                className='mobile:!w-[364px] tablet:!w-[544px] h-[40px] !px-2 font-inter font-normal text-base leading-6 text-[#6C757D]'
              />
            </Form.Item>

            {/* Remember me */}
            <Form.Item<FieldType>
              name='remember'
              valuePropName='checked'
              label={null}
              className='mobile:!w-[364px] tablet:!w-[544px] h-[40px] !px-2 font-inter font-normal text-[12.8px] leading-[19.2px]'
            >
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            {/* Submit button */}
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
              <p className='font-inter font-normal text-sm leading-[21px] text-[#5A5F7D] !pb-[32px] !mb-0'>
                I don’t have an account!{' '}
                <a href='/auth/signup' className='text-[#3C76FF] hover:underline font-inter font-normal text-sm leading-[21px] tracking-normal'>
                  SignUp
                </a>
              </p>
            </div>
          </Form>
        </Card>
      </div>
    </AuthLayout>
  );
}


// 'use client';
// import React from 'react';
// import type { FormProps } from 'antd';
// import { Button, Checkbox, Form, Input, Card } from 'antd';
// import AuthLayout from '../layout';
// import { signIn } from 'next-auth/react';
// import '../auth.css';

// type FieldType = {
//   email?: string;
//   password?: string;
//   remember?: string;
// };

// const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
//   console.log('Login Failed:', errorInfo);
// };

// export default function LoginPage() {
//   const onFinish = async (values: FieldType) => {
//     const res = await signIn('credentials', {
//       redirect: true,
//       email: values.email,
//       password: values.password,
//       callbackUrl: '/'
//     });
//     console.log('Login result:', res);
//   };

//   return (
//     <AuthLayout>
//       <div className='login-container'>
//         <h2 className='login-title'>Login</h2>
//         <Card className='login-card'>
//           <Form
//             name='login'
//             layout='vertical'
//             style={{ maxWidth: 544 }}
//             initialValues={{ remember: true }}
//             onFinish={onFinish}
//             onFinishFailed={onFinishFailed}
//             autoComplete='off'
//           >
//             {/* Email */}
//             <Form.Item<FieldType>
//               label='Enter email address'
//               name='email'
//               rules={[{ required: true, message: 'Enter a valid email address' }]}
//             >
//               <Input
//                 placeholder='Please enter your email'
//                 className='login-input'
//               />
//             </Form.Item>

//             {/* Password */}
//             <Form.Item<FieldType>
//               label='Password'
//               name='password'
//               rules={[{ required: true, message: 'Enter a valid password' }]}
//             >
//               <Input.Password
//                 placeholder='Please enter password'
//                 className='login-input'
//               />
//             </Form.Item>

//             {/* Remember me */}
//             <Form.Item<FieldType>
//               name='remember'
//               valuePropName='checked'
//               className='login-checkbox'
//             >
//               <Checkbox>Remember me</Checkbox>
//             </Form.Item>

//             {/* Submit */}
//             <Form.Item>
//               <Button type='primary' htmlType='submit' className='login-button'>
//                 Login
//               </Button>
//             </Form.Item>

//             {/* Links */}
//             <div className='login-links'>
//               <p className='login-text'>
//                 Forgot Password?{' '}
//                 <a href='/auth/reset' className='login-link'>Reset</a>
//               </p>
//               <p className='login-text !pb-[32px] !mb-0'>
//                 I don’t have an account!{' '}
//                 <a href='/auth/signup' className='login-link'>SignUp</a>
//               </p>
//             </div>
//           </Form>
//         </Card>
//       </div>
//     </AuthLayout>
//   );
// }
