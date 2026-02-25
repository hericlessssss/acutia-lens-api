import 'dotenv/config';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
    schema: path.join(import.meta.dirname, 'prisma', 'schema.prisma'),
    datasource: {
        url: env('DATABASE_URL'),
    },
    migrations: {
        seed: 'npx ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
    },
});
