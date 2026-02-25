import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma';
import { PrismaService } from '../../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { CreatePhotoDto } from './dto/create-photo.dto.js';
import { QueryPhotosDto } from './dto/query-photos.dto.js';

@Injectable()
export class PhotosService {
    constructor(
        private prisma: PrismaService,
        private storageService: StorageService,
    ) { }

    async findAll(query: QueryPhotosDto) {
        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '20', 10);
        const skip = (page - 1) * limit;

        const where: Prisma.PhotoWhereInput = {};

        if (query.eventId) {
            where.eventId = query.eventId;
        }

        if (query.tag) {
            where.tags = { has: query.tag };
        }

        let orderBy: Prisma.PhotoOrderByWithRelationInput = { createdAt: 'desc' };
        if (query.sort === 'price_asc') {
            orderBy = { priceCents: 'asc' };
        } else if (query.sort === 'price_desc') {
            orderBy = { priceCents: 'desc' };
        }

        const [items, total] = await Promise.all([
            this.prisma.photo.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    event: { select: { id: true, name: true } },
                    photographer: {
                        select: {
                            id: true,
                            user: { select: { name: true } },
                        },
                    },
                },
            }),
            this.prisma.photo.count({ where }),
        ]);

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: string) {
        const photo = await this.prisma.photo.findUnique({
            where: { id },
            include: {
                event: { select: { id: true, name: true } },
                photographer: {
                    select: {
                        id: true,
                        user: { select: { name: true } },
                    },
                },
            },
        });

        if (!photo) {
            throw new NotFoundException('Foto não encontrada');
        }

        // Never expose originalUrl in public listings
        return { ...photo, originalUrl: undefined };
    }

    async upload(
        file: Express.Multer.File,
        dto: CreatePhotoDto,
        photographerId: string,
    ) {
        // Upload original file
        const originalUrl = await this.storageService.upload(file, 'originals');

        // In production, we would generate a watermarked version here
        // For MVP, use the same URL for both
        const url = originalUrl;

        const photo = await this.prisma.photo.create({
            data: {
                url,
                originalUrl,
                eventId: dto.eventId,
                photographerId,
                tags: dto.tags || [],
                priceCents: dto.priceCents,
            },
        });

        // Update photo count on event
        await this.prisma.event.update({
            where: { id: dto.eventId },
            data: { photoCount: { increment: 1 } },
        });

        // Update photos count on photographer
        await this.prisma.photographer.update({
            where: { id: photographerId },
            data: { photosCount: { increment: 1 } },
        });

        return photo;
    }

    async remove(id: string, userId: string, userRole: string) {
        const photo = await this.prisma.photo.findUnique({
            where: { id },
            include: { photographer: true },
        });

        if (!photo) {
            throw new NotFoundException('Foto não encontrada');
        }

        if (userRole !== 'ADMIN' && photo.photographer.userId !== userId) {
            throw new ForbiddenException('Sem permissão para remover esta foto');
        }

        await this.prisma.photo.delete({ where: { id } });

        // Decrement event photo count
        await this.prisma.event.update({
            where: { id: photo.eventId },
            data: { photoCount: { decrement: 1 } },
        });

        return { deleted: true };
    }
}
