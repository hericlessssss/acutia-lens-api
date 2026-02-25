import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class SearchService {
    constructor(private prisma: PrismaService) { }

    /**
     * MVP: Returns random photos from the event with simulated matchScore.
     * Fase 3 will integrate AWS Rekognition for real facial matching.
     */
    async searchByFace(eventId?: string) {
        const where = eventId ? { eventId } : {};

        const photos = await this.prisma.photo.findMany({
            where,
            take: 12,
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

        // Shuffle and assign simulated match scores
        const shuffled = photos.sort(() => Math.random() - 0.5);

        return shuffled.map((photo, index) => ({
            ...photo,
            matchScore: Math.max(0.65, 1 - index * 0.05 + (Math.random() * 0.1 - 0.05)),
        }));
    }
}
