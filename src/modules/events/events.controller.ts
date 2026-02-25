import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '../../generated/prisma';
import { Public, Roles } from '../../common/decorators/index.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { QueryEventsDto } from './dto/query-events.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { EventsService } from './events.service.js';

@ApiTags('Events')
@Controller('events')
export class EventsController {
    constructor(private eventsService: EventsService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Lista eventos com filtros e paginação' })
    findAll(@Query() query: QueryEventsDto) {
        return this.eventsService.findAll(query);
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Detalhe de um evento' })
    findOne(@Param('id') id: string) {
        return this.eventsService.findOne(id);
    }

    @Roles(Role.ADMIN)
    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cria evento (Admin)' })
    create(@Body() dto: CreateEventDto) {
        return this.eventsService.create(dto);
    }

    @Roles(Role.ADMIN)
    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Atualiza evento (Admin)' })
    update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
        return this.eventsService.update(id, dto);
    }

    @Roles(Role.ADMIN)
    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove evento (Admin)' })
    remove(@Param('id') id: string) {
        return this.eventsService.remove(id);
    }
}
