import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/index.js';
import { FavoritesService } from './favorites.service.js';

@ApiTags('Favorites')
@Controller('favorites')
@ApiBearerAuth()
export class FavoritesController {
    constructor(private favoritesService: FavoritesService) { }

    @Get()
    @ApiOperation({ summary: 'Lista favoritos do usuário' })
    findAll(@CurrentUser('id') userId: string) {
        return this.favoritesService.findAll(userId);
    }

    @Post(':photoId')
    @ApiOperation({ summary: 'Adiciona/remove favorito (toggle)' })
    toggle(
        @CurrentUser('id') userId: string,
        @Param('photoId') photoId: string,
    ) {
        return this.favoritesService.toggle(userId, photoId);
    }

    @Delete(':photoId')
    @ApiOperation({ summary: 'Remove favorito' })
    remove(
        @CurrentUser('id') userId: string,
        @Param('photoId') photoId: string,
    ) {
        return this.favoritesService.remove(userId, photoId);
    }
}
