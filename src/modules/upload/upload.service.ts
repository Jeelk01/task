import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private readonly folder: string;

  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('cloudinary.cloudName'),
      api_key: this.config.get<string>('cloudinary.apiKey'),
      api_secret: this.config.get<string>('cloudinary.apiSecret'),
      secure: true,
    });
    this.folder = this.config.get<string>('cloudinary.folder') ?? 'structo';
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

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: this.folder,
          public_id: storedName,
          // 'raw' keeps PDFs/Office docs downloadable as-is
          resource_type: mimetype.startsWith('image/') ? 'image' : 'raw',
        },
        (error, res) => (error || !res ? reject(error) : resolve(res)),
      );
      createReadStream().on('error', reject).pipe(upload);
    });

    return {
      filename: storedName,
      mimetype,
      encoding,
      path: result.public_id,
      url: result.secure_url,
    };
  }

  async deleteFile(publicId: string, mimetype: string) {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: mimetype.startsWith('image/') ? 'image' : 'raw',
    });
  }
}
