import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { QueryEventsDto } from './dto/query-events.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';

@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: QueryEventsDto) {
        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '10', 10);
        const skip = (page - 1) * limit;

        const where: Prisma.EventWhereInput = {};

        if (query.status) {
            where.status = query.status;
        }

        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { location: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        const [items, total] = await Promise.all([
            this.prisma.event.findMany({
                where,
                skip,
                take: limit,
                orderBy: { date: 'desc' },
            }),
            this.prisma.event.count({ where }),
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
        const event = await this.prisma.event.findUnique({ where: { id } });
        if (!event) {
            throw new NotFoundException('Evento não encontrado');
        }
        return event;
    }

    async create(dto: CreateEventDto) {
        return this.prisma.event.create({
            data: {
                name: dto.name,
                date: new Date(dto.date),
                location: dto.location,
                thumbnailUrl: dto.thumbnailUrl,
                description: dto.description,
            },
        });
    }

    async update(id: string, dto: UpdateEventDto) {
        await this.findOne(id);

        const data: Prisma.EventUpdateInput = { ...dto };
        if (dto.date) {
            data.date = new Date(dto.date);
        }

        return this.prisma.event.update({ where: { id }, data });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.event.delete({ where: { id } });
    }
}
