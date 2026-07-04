import * as fs from 'node:fs';
import * as path from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { IStorageService } from './interfaces/storage.interface';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
    this.logger.log(`Local storage directory: ${this.uploadsDir}`);
  }

  async uploadFile(buffer: Buffer, filename: string, _mimetype: string): Promise<string> {
    const ext = path.extname(filename);
    const uniqueName = `${uuidv4()}${ext}`;
    const filePath = path.join(this.uploadsDir, uniqueName);

    fs.writeFileSync(filePath, buffer);
    this.logger.log(`File saved locally: ${uniqueName}`);

    // Return a URL path served by ServeStaticModule
    return `/uploads/${uniqueName}`;
  }
}
