import { registerAs } from '@nestjs/config';

export type PaymentProvider = 'stripe' | 'paypal' | 'square';

/**
 * Payment Provider configuration namespace
 * Supports multiple payment gateways
 */
export default registerAs('payment', () => ({
  provider: (process.env.PAYMENT_PROVIDER as PaymentProvider) || 'stripe',

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  // PayPal
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    mode: process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' | 'live'
  },

  // Square
  square: {
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.SQUARE_ENVIRONMENT || 'sandbox', // 'sandbox' | 'production'
    applicationId: process.env.SQUARE_APPLICATION_ID,
  },
}));
