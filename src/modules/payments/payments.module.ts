import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { WebhooksController } from './webhooks.controller.js';

@Module({
    controllers: [WebhooksController],
    providers: [PaymentsService],
    exports: [PaymentsService],
})
export class PaymentsModule { }
