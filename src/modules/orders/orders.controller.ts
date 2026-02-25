import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/index.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrdersService } from './orders.service.js';

@ApiTags('Orders')
@Controller('orders')
@ApiBearerAuth()
export class OrdersController {
    constructor(private ordersService: OrdersService) { }

    @Post()
    @ApiOperation({ summary: 'Cria pedido com itens do carrinho' })
    create(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateOrderDto,
    ) {
        return this.ordersService.create(userId, dto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Detalhe do pedido (inclui URLs de download se APROVADO)' })
    findOne(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.ordersService.findOne(id, userId);
    }

    @Get()
    @ApiOperation({ summary: 'Lista pedidos do usuário' })
    findAll(@CurrentUser('id') userId: string) {
        return this.ordersService.findByUser(userId);
    }
}
