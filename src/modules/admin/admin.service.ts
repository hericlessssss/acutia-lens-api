import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PhotographerStatus } from '../../generated/prisma';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        const [
            totalEvents,
            totalPhotos,
            totalOrders,
            totalUsers,
            revenueResult,
        ] = await Promise.all([
            this.prisma.event.count(),
            this.prisma.photo.count(),
            this.prisma.order.count({ where: { status: 'APROVADO' } }),
            this.prisma.user.count(),
            this.prisma.order.aggregate({
                where: { status: 'APROVADO' },
                _sum: { totalCents: true },
            }),
        ]);

        return {
            totalEvents,
            totalPhotos,
            totalOrders,
            totalUsers,
            totalRevenueCents: revenueResult._sum.totalCents || 0,
        };
    }

    async getRevenueByEvent() {
        const orders = await this.prisma.order.findMany({
            where: { status: 'APROVADO' },
            include: {
                items: {
                    include: {
                        photo: {
                            select: {
                                event: { select: { id: true, name: true } },
                            },
                        },
                    },
                },
            },
        });

        // Aggregate revenue by event
        const revenueMap = new Map<string, { eventId: string; eventName: string; revenueCents: number; orderCount: number }>();

        for (const order of orders) {
            for (const item of order.items) {
                const eventId = item.photo.event.id;
                const eventName = item.photo.event.name;
                const existing = revenueMap.get(eventId) || {
                    eventId,
                    eventName,
                    revenueCents: 0,
                    orderCount: 0,
                };
                existing.revenueCents += item.priceCents * item.quantity;
                existing.orderCount += 1;
                revenueMap.set(eventId, existing);
            }
        }

        return Array.from(revenueMap.values()).sort(
            (a, b) => b.revenueCents - a.revenueCents,
        );
    }

    async getPhotographers() {
        return this.prisma.photographer.findMany({
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updatePhotographerStatus(photographerId: string, status: PhotographerStatus) {
        return this.prisma.photographer.update({
            where: { id: photographerId },
            data: { status },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
}
