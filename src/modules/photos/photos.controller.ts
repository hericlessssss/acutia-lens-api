import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, Public, Roles } from '../../common/decorators/index.js';
import { CreatePhotoDto } from './dto/create-photo.dto.js';
import { QueryPhotosDto } from './dto/query-photos.dto.js';
import { PhotosService } from './photos.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ForbiddenException } from '@nestjs/common';

@ApiTags('Photos')
@Controller('photos')
export class PhotosController {
    constructor(
        private photosService: PhotosService,
        private prisma: PrismaService,
    ) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Lista fotos com filtros e paginação' })
    findAll(@Query() query: QueryPhotosDto) {
        return this.photosService.findAll(query);
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Detalhe de foto (retorna URL com marca d\'água)' })
    findOne(@Param('id') id: string) {
        return this.photosService.findOne(id);
    }

    @Roles(Role.PHOTOGRAPHER)
    @Post('upload')
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload de foto para um evento (Fotógrafo)' })
    @UseInterceptors(FileInterceptor('file'))
    async upload(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: CreatePhotoDto,
        @CurrentUser('id') userId: string,
    ) {
        // Find the photographer record for this user
        const photographer = await this.prisma.photographer.findUnique({
            where: { userId },
        });

        if (!photographer) {
            throw new ForbiddenException('Perfil de fotógrafo não encontrado');
        }

        if (photographer.status !== 'APROVADO') {
            throw new ForbiddenException('Fotógrafo ainda não aprovado');
        }

        return this.photosService.upload(file, dto, photographer.id);
    }

    @Roles(Role.PHOTOGRAPHER, Role.ADMIN)
    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove foto (Fotógrafo/Admin)' })
    remove(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @CurrentUser('role') role: string,
    ) {
        return this.photosService.remove(id, userId, role);
    }
}
