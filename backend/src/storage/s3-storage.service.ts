import * as path from 'node:path';
import { PutObjectCommand, type PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import type { IStorageService } from './interfaces/storage.interface';

@Injectable()
export class S3StorageService implements IStorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('AWS_S3_BUCKET') ?? '';
    const region = this.config.get<string>('AWS_REGION', 'us-east-1');
    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID') ?? '';
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY') ?? '';

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.logger.log(`S3 storage instantiated (bucket: "${this.bucket}")`);
  }

  async uploadFile(buffer: Buffer, filename: string, mimetype: string): Promise<string> {
    const ext = path.extname(filename);
    const key = `audio/${uuidv4()}${ext}`;

    const params: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    };

    await this.s3Client.send(new PutObjectCommand(params));
    this.logger.log(`File uploaded to S3: ${key}`);

    // Generate a pre-signed URL valid for 7 days
    const getCommand = new PutObjectCommand(params);
    const signedUrl = await getSignedUrl(this.s3Client, getCommand, {
      expiresIn: 60 * 60 * 24 * 7,
    });

    return signedUrl;
  }
}
