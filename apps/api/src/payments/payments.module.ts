import { Body, Controller, Headers, Post, Req, UseGuards, Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/auth.module';
import { User, PaymentStatus } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/payments.dto';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger('PaymentsController');

  constructor(private paymentsService: PaymentsService) {}

  @Post('connect/onboard')
  @UseGuards(ClerkAuthGuard)
  onboard(@CurrentUser() user: User) {
    return this.paymentsService.createConnectOnboardingLink(user.id);
  }

  @Post('intents')
  @UseGuards(ClerkAuthGuard)
  createIntent(@CurrentUser() user: User, @Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(user.id, dto);
  }

  // Registered with raw body (see main.ts `rawBody: true`) since Stripe
  // signature verification needs the exact unparsed payload bytes.
  @Post('webhook')
  async webhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') signature: string) {
    const event = this.paymentsService.constructWebhookEvent(req.rawBody as Buffer, signature);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as any;
        await this.paymentsService.markPaymentStatus(intent.id, PaymentStatus.SUCCEEDED);
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as any;
        await this.paymentsService.markPaymentStatus(intent.id, PaymentStatus.FAILED);
        break;
      }
      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }

    return { received: true };
  }
}

@Module({
  imports: [ConfigModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
