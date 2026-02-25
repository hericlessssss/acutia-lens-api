import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private readonly s3: S3Client;
    private readonly bucket: string;
    private readonly endpoint: string;

    constructor(private configService: ConfigService) {
        this.endpoint = this.configService.get<string>('STORAGE_ENDPOINT')
            || 'https://br-se1.magaluobjects.com';
        this.bucket = this.configService.get<string>('STORAGE_BUCKET') || 'disaster-recovery';

        this.s3 = new S3Client({
            endpoint: this.endpoint,
            region: 'br-se1',
            credentials: {
                accessKeyId: this.configService.get<string>('STORAGE_ACCESS_KEY')!,
                secretAccessKey: this.configService.get<string>('STORAGE_SECRET_KEY')!,
            },
            forcePathStyle: true, // Required for S3-compatible services
        });
    }

    async upload(
        file: Express.Multer.File,
        folder: string = 'photos',
    ): Promise<string> {
        const ext = file.originalname.split('.').pop() || 'jpg';
        const key = `${folder}/${randomUUID()}.${ext}`;

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
        });

        await this.s3.send(command);

        const publicUrl = `${this.endpoint}/${this.bucket}/${key}`;
        this.logger.log(`File uploaded: ${publicUrl}`);
        return publicUrl;
    }

    async delete(fileUrl: string): Promise<void> {
        // Extract key from full URL
        // URL format: https://br-se1.magaluobjects.com/bucket/folder/file.jpg
        const prefix = `${this.endpoint}/${this.bucket}/`;
        const key = fileUrl.startsWith(prefix)
            ? fileUrl.slice(prefix.length)
            : fileUrl;

        if (!key) {
            this.logger.warn(`Could not extract key from URL: ${fileUrl}`);
            return;
        }

        const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        await this.s3.send(command);
        this.logger.log(`File deleted: ${key}`);
    }
}
