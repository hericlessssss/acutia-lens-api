import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class FavoritesService {
    constructor(private prisma: PrismaService) { }

    async findAll(userId: string) {
        return this.prisma.favorite.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                photo: {
                    include: {
                        event: { select: { id: true, name: true } },
                    },
                },
            },
        });
    }

    async toggle(userId: string, photoId: string) {
        const existing = await this.prisma.favorite.findUnique({
            where: { userId_photoId: { userId, photoId } },
        });

        if (existing) {
            await this.prisma.favorite.delete({ where: { id: existing.id } });
            return { favorited: false };
        }

        await this.prisma.favorite.create({
            data: { userId, photoId },
        });

        return { favorited: true };
    }

    async remove(userId: string, photoId: string) {
        const existing = await this.prisma.favorite.findUnique({
            where: { userId_photoId: { userId, photoId } },
        });

        if (existing) {
            await this.prisma.favorite.delete({ where: { id: existing.id } });
        }

        return { favorited: false };
    }
}
