import { ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsNumberString } from 'class-validator';

export class QueryEventsDto {
    @ApiPropertyOptional({ enum: EventStatus })
    @IsEnum(EventStatus)
    @IsOptional()
    status?: EventStatus;

    @ApiPropertyOptional({ example: 'gama' })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({ example: '1', default: '1' })
    @IsNumberString()
    @IsOptional()
    page?: string;

    @ApiPropertyOptional({ example: '10', default: '10' })
    @IsNumberString()
    @IsOptional()
    limit?: string;
}
