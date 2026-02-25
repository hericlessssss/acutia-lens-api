import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateEventDto {
    @ApiProperty({ example: 'Gama x Rival FC — Campeonato Brasiliense' })
    @IsString()
    name!: string;

    @ApiProperty({ example: '2025-03-15T00:00:00.000Z' })
    @IsDateString()
    date!: string;

    @ApiProperty({ example: 'Estádio Bezerrão, Gama-DF' })
    @IsString()
    location!: string;

    @ApiProperty({ example: 'https://example.com/thumb.jpg' })
    @IsString()
    thumbnailUrl!: string;

    @ApiPropertyOptional({ example: 'Jogo válido pela 5ª rodada' })
    @IsString()
    @IsOptional()
    description?: string;
}
