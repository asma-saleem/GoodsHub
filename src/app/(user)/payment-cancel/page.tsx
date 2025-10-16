'use client';

import Link from 'next/link';
import { Result, Button } from 'antd';
import React from 'react';

const PaymentCancelPage = () => {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Result
        status="warning"
        title="Payment was cancelled"
        subTitle="You have cancelled the checkout process. Your order was not completed."
        extra={[
          <Link key="home" href="/">
            <Button>Continue Shopping</Button>
          </Link>
        ]}
      />
    </div>
  );
};

export default PaymentCancelPage;
