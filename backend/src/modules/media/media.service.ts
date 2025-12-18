import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION = 'media';

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(private readonly database: DatabaseService) {}

  async create(data: Partial<MediaItem>): Promise<MediaItem> {
    return this.database.create<MediaItem>(COLLECTION, data);
  }

  async findAll(page = 1, limit = 20): Promise<{ data: MediaItem[]; total: number }> {
    return this.database.findAll<MediaItem>(COLLECTION, {
      page,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }

  async findById(id: string): Promise<MediaItem | null> {
    return this.database.findById<MediaItem>(COLLECTION, id);
  }

  async update(id: string, data: Partial<MediaItem>): Promise<MediaItem> {
    return this.database.update<MediaItem>(COLLECTION, id, data);
  }

  async remove(id: string): Promise<boolean> {
    // In production, also delete the file from storage
    return this.database.delete(COLLECTION, id);
  }

  // Note: Actual file upload handling would be done with multer middleware
  // This is a placeholder for the upload logic
  async processUpload(
    file: { filename: string; originalname: string; mimetype: string; size: number; path: string },
    userId: string,
  ): Promise<MediaItem> {
    const media: Partial<MediaItem> = {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      uploadedBy: userId,
    };

    return this.create(media);
  }
}
