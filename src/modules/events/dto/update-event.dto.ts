import { ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateEventDto {
    @ApiPropertyOptional({ example: 'Gama x Rival FC — Campeonato Brasiliense' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ example: '2025-03-15T00:00:00.000Z' })
    @IsDateString()
    @IsOptional()
    date?: string;

    @ApiPropertyOptional({ example: 'Estádio Bezerrão, Gama-DF' })
    @IsString()
    @IsOptional()
    location?: string;

    @ApiPropertyOptional({ example: 'https://example.com/thumb.jpg' })
    @IsString()
    @IsOptional()
    thumbnailUrl?: string;

    @ApiPropertyOptional({ example: 'Descrição do evento' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ enum: EventStatus })
    @IsEnum(EventStatus)
    @IsOptional()
    status?: EventStatus;
}
