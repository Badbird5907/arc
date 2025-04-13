import Stripe from 'stripe';
import { env } from '@/env';

export const stripeClient = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil',
  typescript: true,
}) : null; 