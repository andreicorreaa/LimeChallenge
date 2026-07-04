import * as fs from 'node:fs';
import * as path from 'node:path';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { STORAGE_SERVICE } from './interfaces/storage.interface';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';
import { StorageModule } from './storage.module';

// Mock AWS S3 SDK
const mockSend = jest.fn();
jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    PutObjectCommand: jest.fn().mockImplementation((params) => params),
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    getSignedUrl: jest.fn().mockResolvedValue('https://s3/pre-signed-url'),
  };
});

describe('Storage Services', () => {
  describe('LocalStorageService', () => {
    let service: LocalStorageService;
    const testDir = path.join(process.cwd(), 'uploads');

    beforeEach(() => {
      service = new LocalStorageService();
    });

    it('should create uploads folder if not exists', () => {
      expect(fs.existsSync(testDir)).toBe(true);
    });

    it('should save file to uploads folder and return path', async () => {
      const mockBuffer = Buffer.from('test-content');
      const filename = 'audio.mp3';
      const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

      const result = await service.uploadFile(mockBuffer, filename, 'audio/mp3');

      expect(result).toMatch(/^\/uploads\/[a-f0-9-]+\.mp3$/);
      expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining(testDir), mockBuffer);

      writeSpy.mockRestore();
    });
  });

  describe('S3StorageService', () => {
    let service: S3StorageService;
    let configService: ConfigService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          S3StorageService,
          {
            provide: ConfigService,
            useValue: {
              getOrThrow: jest.fn().mockImplementation((key: string) => {
                if (key === 'AWS_S3_BUCKET') return 'test-bucket';
                if (key === 'AWS_ACCESS_KEY_ID') return 'key-id';
                if (key === 'AWS_SECRET_ACCESS_KEY') return 'secret';
                return null;
              }),
              get: jest.fn().mockReturnValue('us-east-1'),
            },
          },
        ],
      }).compile();

      service = module.get<S3StorageService>(S3StorageService);
      configService = module.get<ConfigService>(ConfigService);
    });

    it('should upload file to S3 and return presigned URL', async () => {
      const mockBuffer = Buffer.from('test-content');
      mockSend.mockResolvedValue({});

      const result = await service.uploadFile(mockBuffer, 'audio.wav', 'audio/wav');

      expect(result).toBe('https://s3/pre-signed-url');
      expect(mockSend).toHaveBeenCalled();
    });
  });

  describe('StorageModule Factory', () => {
    let configMap: Record<string, string | undefined> = {};

    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => configMap[key]),
      getOrThrow: jest.fn().mockImplementation((key: string) => {
        const val = configMap[key];
        if (!val) throw new Error(`${key} not set`);
        return val;
      }),
    };

    beforeEach(() => {
      configMap = {};
    });

    it('should select S3StorageService when S3 config is fully provided', async () => {
      configMap = {
        AWS_S3_BUCKET: 'test-bucket',
        AWS_ACCESS_KEY_ID: 'key-id',
        AWS_SECRET_ACCESS_KEY: 'secret',
        AWS_REGION: 'us-east-1',
      };

      const module: TestingModule = await Test.createTestingModule({
        imports: [StorageModule],
      })
        .overrideProvider(ConfigService)
        .useValue(mockConfigService)
        .compile();

      const storageService = module.get(STORAGE_SERVICE);
      expect(storageService).toBeInstanceOf(S3StorageService);
    });

    it('should fallback to LocalStorageService when S3 config is missing', async () => {
      configMap = {
        AWS_S3_BUCKET: '',
        AWS_ACCESS_KEY_ID: '',
        AWS_SECRET_ACCESS_KEY: '',
      };

      const module: TestingModule = await Test.createTestingModule({
        imports: [StorageModule],
      })
        .overrideProvider(ConfigService)
        .useValue(mockConfigService)
        .compile();

      const storageService = module.get(STORAGE_SERVICE);
      expect(storageService).toBeInstanceOf(LocalStorageService);
    });
  });
});
