import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PhotographerStatus, Role } from '@prisma/client';
import { Roles } from '../../common/decorators/index.js';
import { AdminService } from './admin.service.js';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class UpdatePhotographerStatusDto {
    @ApiProperty({ enum: PhotographerStatus })
    @IsEnum(PhotographerStatus)
    status!: PhotographerStatus;
}

@ApiTags('Admin')
@Controller('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Métricas gerais: eventos, fotos, vendas, receita' })
    getStats() {
        return this.adminService.getStats();
    }

    @Get('revenue-by-event')
    @ApiOperation({ summary: 'Receita agrupada por evento' })
    getRevenueByEvent() {
        return this.adminService.getRevenueByEvent();
    }

    @Get('photographers')
    @ApiOperation({ summary: 'Lista fotógrafos com status' })
    getPhotographers() {
        return this.adminService.getPhotographers();
    }

    @Patch('photographers/:id/status')
    @ApiOperation({ summary: 'Altera status do fotógrafo (aprovado/pendente)' })
    updatePhotographerStatus(
        @Param('id') id: string,
        @Body() dto: UpdatePhotographerStatusDto,
    ) {
        return this.adminService.updatePhotographerStatus(id, dto.status);
    }
}
