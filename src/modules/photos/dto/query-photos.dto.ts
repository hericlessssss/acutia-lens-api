import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class QueryPhotosDto {
    @ApiPropertyOptional({ example: 'event-uuid-here' })
    @IsString()
    @IsOptional()
    eventId?: string;

    @ApiPropertyOptional({ example: 'torcida' })
    @IsString()
    @IsOptional()
    tag?: string;

    @ApiPropertyOptional({ example: 'recent', enum: ['recent', 'price_asc', 'price_desc'] })
    @IsString()
    @IsOptional()
    sort?: string;

    @ApiPropertyOptional({ example: '1', default: '1' })
    @IsNumberString()
    @IsOptional()
    page?: string;

    @ApiPropertyOptional({ example: '20', default: '20' })
    @IsNumberString()
    @IsOptional()
    limit?: string;
}
