import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';
import { CreatePaymentIntentDto } from './dto/payments.dto';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2024-06-20',
    });
  }

  /**
   * Onboards a warehouse owner / investor as a Stripe Connect Express
   * account so platform commissions (listing fees, bid fees, transaction
   * commissions — see PRD "Marketplace Revenue") can be split automatically
   * via `application_fee_amount` on future PaymentIntents.
   */
  async createConnectOnboardingLink(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    let accountId = user.stripeAccountId;
    if (!accountId) {
      const account = await this.stripe.accounts.create({ type: 'express', email: user.email });
      accountId = account.id;
      await this.prisma.user.update({ where: { id: userId }, data: { stripeAccountId: accountId } });
    }

    const link = await this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${this.config.get('WEB_APP_URL')}/owner/payments?refresh=true`,
      return_url: `${this.config.get('WEB_APP_URL')}/owner/payments?success=true`,
      type: 'account_onboarding',
    });

    return { url: link.url };
  }

  async createPaymentIntent(userId: string, dto: CreatePaymentIntentDto) {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(dto.amount * 100),
      currency: dto.currency ?? 'gbp',
      metadata: { userId, purpose: dto.purpose, chargingSessionId: dto.chargingSessionId ?? '' },
      automatic_payment_methods: { enabled: true },
    });

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        stripePaymentIntentId: intent.id,
        amount: dto.amount,
        currency: dto.currency ?? 'gbp',
        status: PaymentStatus.PENDING,
        chargingSessionId: dto.chargingSessionId,
        description: dto.description ?? dto.purpose,
      },
    });

    return { clientSecret: intent.client_secret, payment };
  }

  /** Called from the webhook controller once Stripe confirms the payment server-side. */
  async markPaymentStatus(stripePaymentIntentId: string, status: PaymentStatus) {
    return this.prisma.payment.updateMany({
      where: { stripePaymentIntentId },
      data: { status },
    });
  }

  constructWebhookEvent(rawBody: Buffer, signature: string) {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET') ?? '';
    return this.stripe.webhooks.constructEvent(rawBody, signature, secret);
  }
}
