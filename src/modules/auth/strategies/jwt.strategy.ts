import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service.js';

export interface SupabaseJwtPayload {
    sub: string;         // Supabase auth.users.id
    email: string;
    role: string;        // Supabase default role (e.g. 'authenticated')
    app_metadata?: {
        role?: string;   // Custom app role (CLIENT, PHOTOGRAPHER, ADMIN)
    };
    user_metadata?: {
        name?: string;
    };
    aud: string;
    exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        private prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('SUPABASE_JWT_SECRET')!,
        });
    }

    async validate(payload: SupabaseJwtPayload) {
        if (!payload.sub) {
            throw new UnauthorizedException('Token inválido');
        }

        // Auto-sync: upsert user in our DB on every token validation
        const user = await this.prisma.user.upsert({
            where: { authId: payload.sub },
            update: { email: payload.email },
            create: {
                authId: payload.sub,
                email: payload.email,
                name: payload.user_metadata?.name || payload.email.split('@')[0],
            },
            select: {
                id: true,
                authId: true,
                email: true,
                name: true,
                role: true,
            },
        });

        // Return DB user — this becomes request.user
        return {
            id: user.id,
            authId: user.authId,
            email: user.email,
            name: user.name,
            role: user.role,
        };
    }
}
