import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import {
    IsArray,
    IsEmail,
    IsEnum,
    IsInt,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
    @ApiProperty({ example: 'photo-uuid-here' })
    @IsString()
    photoId!: string;

    @ApiProperty({ example: 1 })
    @IsInt()
    @Min(1)
    quantity!: number;
}

export class CreateOrderDto {
    @ApiProperty({ example: 'João Silva' })
    @IsString()
    customerName!: string;

    @ApiProperty({ example: 'joao@email.com' })
    @IsEmail()
    customerEmail!: string;

    @ApiProperty({ enum: PaymentMethod })
    @IsEnum(PaymentMethod)
    paymentMethod!: PaymentMethod;

    @ApiProperty({ type: [OrderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items!: OrderItemDto[];
}
