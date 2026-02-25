import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    /**
     * Placeholder for Mercado Pago integration (Fase 2).
     * In MVP, orders are auto-approved without real payment processing.
     */
    async createPayment(_orderId: string, _totalCents: number, _paymentMethod: string) {
        this.logger.warn('PaymentsService.createPayment() is a stub — payments are not yet integrated');
        return {
            externalPaymentId: `mock-${Date.now()}`,
            status: 'approved',
        };
    }

    async handleWebhook(_payload: any) {
        this.logger.warn('PaymentsService.handleWebhook() is a stub — webhooks are not yet integrated');
        return { received: true };
    }
}
