import 'dotenv/config';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
    schema: path.join(import.meta.dirname, 'prisma', 'schema.prisma'),
    datasource: {
        // CLI commands (migrate, introspect) use the DIRECT connection
        url: env('DIRECT_URL'),
    },
    migrations: {
        seed: 'npx ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
    },
});
