import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private readonly uploadDir = path.resolve(process.cwd(), 'uploads');

    constructor() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async upload(
        file: Express.Multer.File,
        folder: string = 'photos',
    ): Promise<string> {
        const dir = path.join(this.uploadDir, folder);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const filename = `${Date.now()}-${file.originalname}`;
        const filepath = path.join(dir, filename);

        fs.writeFileSync(filepath, file.buffer);

        this.logger.log(`File uploaded: ${filepath}`);

        // Return a relative URL; in production this would be an S3/Supabase URL
        return `/uploads/${folder}/${filename}`;
    }

    async delete(fileUrl: string): Promise<void> {
        const filepath = path.resolve(process.cwd(), fileUrl.replace(/^\//, ''));
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            this.logger.log(`File deleted: ${filepath}`);
        }
    }
}
