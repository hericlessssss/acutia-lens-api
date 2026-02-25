import {
    Body,
    Controller,
    Get,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public } from '../../common/decorators/index.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Cadastro de novo usuário' })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Public()
    @UseGuards(AuthGuard('local'))
    @Post('login')
    @ApiOperation({ summary: 'Login — retorna access_token + refresh_token' })
    login(@Body() _dto: LoginDto, @CurrentUser() user: any) {
        return this.authService.login(user);
    }

    @Public()
    @Post('refresh')
    @ApiOperation({ summary: 'Renova access_token usando refresh_token' })
    refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refresh(dto.refreshToken);
    }

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
