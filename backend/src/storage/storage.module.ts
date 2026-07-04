import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { STORAGE_SERVICE } from './interfaces/storage.interface';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';

/**
 * StorageModule — Strategy Pattern
 *
 * Automatically selects the storage provider at startup:
 * - S3StorageService   → when AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, and
 *                        AWS_SECRET_ACCESS_KEY are all set in env
 * - LocalStorageService → otherwise (default)
 *
 * No code changes needed to switch — just update the .env file.
 */
@Module({
  imports: [ConfigModule],
  providers: [
    LocalStorageService,
    S3StorageService,
    {
      provide: STORAGE_SERVICE,
      useFactory: (config: ConfigService, local: LocalStorageService, s3: S3StorageService) => {
        const bucket = config.get<string>('AWS_S3_BUCKET');
        const keyId = config.get<string>('AWS_ACCESS_KEY_ID');
        const secret = config.get<string>('AWS_SECRET_ACCESS_KEY');

        const useS3 = Boolean(bucket && keyId && secret);
        const logger = new Logger('StorageModule');

        if (useS3) {
          logger.log('Storage provider: AWS S3');
          return s3;
        }

        logger.log('Storage provider: Local filesystem');
        return local;
      },
      inject: [ConfigService, LocalStorageService, S3StorageService],
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
