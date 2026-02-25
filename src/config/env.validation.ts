import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}

class EnvironmentVariables {
    @IsString()
    DATABASE_URL!: string;

    @IsString()
    JWT_SECRET!: string;

    @IsString()
    @IsOptional()
    JWT_EXPIRATION?: string;

    @IsString()
    @IsOptional()
    JWT_REFRESH_SECRET?: string;

    @IsString()
    @IsOptional()
    JWT_REFRESH_EXPIRATION?: string;

    @IsNumber()
    @IsOptional()
    PORT?: number;

    @IsString()
    @IsOptional()
    CORS_ORIGIN?: string;

    @IsEnum(Environment)
    @IsOptional()
    NODE_ENV?: Environment;
}

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false,
    });

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }

    return validatedConfig;
}
