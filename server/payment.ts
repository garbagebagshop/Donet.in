import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export interface PaymentOrder {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export async function createPaymentOrder(orderData: PaymentOrder) {
  try {
    const options = {
      amount: orderData.amount * 100, // Razorpay expects amount in paisa
      currency: orderData.currency,
      receipt: orderData.receipt,
      notes: orderData.notes,
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error creating payment order:', error);
    throw new Error('Payment order creation failed');
  }
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const sign = orderId + '|' + paymentId;
  const expectedSign = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(sign.toString())
    .digest('hex');

  return expectedSign === signature;
}

export async function capturePayment(paymentId: string, amount: number) {
  try {
    const capture = await razorpay.payments.capture(paymentId, amount * 100);
    return capture;
  } catch (error) {
    console.error('Error capturing payment:', error);
    throw new Error('Payment capture failed');
  }
}