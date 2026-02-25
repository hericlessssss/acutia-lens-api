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
    @IsOptional()
    DIRECT_URL?: string;

    @IsString()
    SUPABASE_URL!: string;

    @IsString()
    SUPABASE_SERVICE_ROLE_KEY!: string;

    @IsString()
    SUPABASE_JWT_SECRET!: string;

    @IsString()
    @IsOptional()
    STORAGE_ENDPOINT?: string;

    @IsString()
    @IsOptional()
    STORAGE_BUCKET?: string;

    @IsString()
    @IsOptional()
    STORAGE_ACCESS_KEY?: string;

    @IsString()
    @IsOptional()
    STORAGE_SECRET_KEY?: string;

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
