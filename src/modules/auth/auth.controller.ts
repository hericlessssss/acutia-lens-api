import {
    Controller,
    Get,
    Patch,
    Body,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/index.js';
import { AuthService } from './auth.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Retorna dados do usuário logado' })
    getProfile(@CurrentUser('id') userId: string) {
        return this.authService.getProfile(userId);
    }

    @Patch('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Atualiza perfil (name, avatarUrl)' })
    updateProfile(
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateProfileDto,
    ) {
        return this.authService.updateProfile(userId, dto);
    }
}
