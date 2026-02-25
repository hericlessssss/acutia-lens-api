import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@Injectable()
export class OrdersService {
    private static readonly PLATFORM_FEE_RATE = 0.05; // 5%

    constructor(private prisma: PrismaService) { }

    async create(userId: string, dto: CreateOrderDto) {
        // Fetch photos to calculate prices
        const photoIds = dto.items.map((item) => item.photoId);
        const photos = await this.prisma.photo.findMany({
            where: { id: { in: photoIds } },
        });

        if (photos.length !== photoIds.length) {
            throw new NotFoundException('Uma ou mais fotos não foram encontradas');
        }

        const photoMap = new Map(photos.map((p) => [p.id, p]));

        // Calculate totals
        let subtotalCents = 0;
        const orderItems = dto.items.map((item) => {
            const photo = photoMap.get(item.photoId)!;
            const itemTotal = photo.priceCents * item.quantity;
            subtotalCents += itemTotal;
            return {
                photoId: item.photoId,
                priceCents: photo.priceCents,
                quantity: item.quantity,
            };
        });

        const platformFeeCents = Math.round(
            subtotalCents * OrdersService.PLATFORM_FEE_RATE,
        );
        const totalCents = subtotalCents + platformFeeCents;

        // Create order with items in a transaction
        const order = await this.prisma.order.create({
            data: {
                userId,
                customerName: dto.customerName,
                customerEmail: dto.customerEmail,
                paymentMethod: dto.paymentMethod,
                subtotalCents,
                platformFeeCents,
                totalCents,
                // MVP: auto-approve orders (no real payment processing)
                status: 'APROVADO',
                paidAt: new Date(),
                items: {
                    create: orderItems,
                },
            },
            include: {
                items: {
                    include: {
                        photo: {
                            select: { id: true, url: true, originalUrl: true },
                        },
                    },
                },
            },
        });

        return order;
    }

    async findOne(id: string, userId: string) {
        const order = await this.prisma.order.findFirst({
            where: { id, userId },
            include: {
                items: {
                    include: {
                        photo: {
                            select: {
                                id: true,
                                url: true,
                                originalUrl: true,
                                event: { select: { id: true, name: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            throw new NotFoundException('Pedido não encontrado');
        }

        // Only expose originalUrl if order is APROVADO
        if (order.status !== 'APROVADO') {
            order.items = order.items.map((item) => ({
                ...item,
                photo: { ...item.photo, originalUrl: undefined as any },
            }));
        }

        return order;
    }

    async findByUser(userId: string) {
        return this.prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: {
                        photo: {
                            select: { id: true, url: true },
                        },
                    },
                },
            },
        });
    }
}
