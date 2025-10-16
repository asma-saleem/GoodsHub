'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Spin, Button, Card, Divider } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

interface StripeSessionMetadata {
  orderId?: string;
  userId?: string;
}

interface StripeSession {
  id: string;
  payment_status: string;
  currency: string;
  amount_total: number;
  metadata: StripeSessionMetadata;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<StripeSession | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      toast.error('Missing session ID');
      router.push('/');
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'Payment verification failed');
          router.push('/');
          return;
        }

        setSession({
          id: data.session.id,
          payment_status: data.session.payment_status,
          currency: data.session.currency,
          amount_total: data.session.amount_total,
          metadata: data.session.metadata
        });

        toast.success('Payment successful!');
        const userId = data.session.metadata?.userId;
        if (userId) {
          localStorage.removeItem(`cart_${userId}`);
        }
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong during verification');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <Card
        className="max-w-md w-full text-center shadow-xl rounded-xl !px-13 !py-8 bg-white"
      >
        <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
        <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
        <p className="text-gray-700 mb-6">
          Thank you for your order. Your payment has been received and your order is being processed.
        </p>

        {session && (
          <div className="mb-6 text-left">
            <Divider>Order Summary</Divider>
            <p><strong>Amount Paid:</strong> ${(session.amount_total / 100).toFixed(2)}</p>
            <p><strong>Currency:</strong> {session.currency.toUpperCase()}</p>
          </div>
        )}

        <Button
          type="primary"
          size="large"
          className="w-full"
          onClick={() => router.push('/orders')}
        >
          View My Orders
        </Button>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen bg-gray-50"><Spin size="large" /></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

