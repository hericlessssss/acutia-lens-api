import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePhotoDto {
    @ApiProperty({ example: 'event-uuid-here' })
    @IsString()
    eventId!: string;

    @ApiPropertyOptional({ example: ['torcida', 'campo'] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @ApiProperty({ example: 1990 })
    @IsInt()
    @Min(1)
    priceCents!: number;
}
