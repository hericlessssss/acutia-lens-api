import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/index.js';
import { PaymentsService } from './payments.service.js';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
    constructor(private paymentsService: PaymentsService) { }

    @Public()
    @Post('mercadopago')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Webhook do Mercado Pago (fase futura)' })
    async handleMercadoPago(@Body() payload: any) {
        return this.paymentsService.handleWebhook(payload);
    }
}
