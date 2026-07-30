import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private readonly uploadDir: string;

  constructor(private readonly config: ConfigService) {
    this.uploadDir = this.config.get<string>('upload.dir') ?? 'uploads';

    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: any) {
    const { createReadStream, filename, mimetype, encoding } = await file;

    const allowed = [
      'image/',
      'application/pdf',
      'application/msword',
      'application/vnd',
    ];

    if (!allowed.some((a) => mimetype.startsWith(a))) {
      throw new BadRequestException('File type not allowed');
    }

    const storedName = `${randomUUID()}-${filename}`;
    const fullPath = join(this.uploadDir, storedName);

    return new Promise<{
      filename: string;
      mimetype: string;
      encoding: string;
      path: string;
      url: string;
    }>((resolve, reject) => {
      const stream = createReadStream();
      const out = createWriteStream(fullPath);

      stream
        .pipe(out)
        .on('finish', () =>
          resolve({
            filename: storedName,
            mimetype,
            encoding,
            path: fullPath,
            url: `/uploads/${storedName}`,
          }),
        )
        .on('error', reject);
    });
  }
}
