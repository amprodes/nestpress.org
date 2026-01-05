import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { ThemeConverterService } from './theme-converter.service';
import { ConversionResult } from './interfaces/converter.interfaces';
import { Public } from '../../common/decorators/public.decorator';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('Theme Converter')
@Controller('theme-converter')
@Public()
export class ThemeConverterController {
  constructor(private readonly themeConverterService: ThemeConverterService) {}

  /**
   * POST /api/v1/theme-converter/convert
   * Upload and convert WordPress theme ZIP to NestPress TSX theme
   */
  @Post('convert')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('theme', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = path.join(process.cwd(), 'temp', 'theme-uploads');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `theme-${uniqueSuffix}.zip`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/zip' && !file.originalname.endsWith('.zip')) {
          return cb(new BadRequestException('Only ZIP files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
      },
    }),
  )
  @ApiOperation({ summary: 'Convert WordPress theme to NestPress TSX format' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        theme: {
          type: 'string',
          format: 'binary',
          description: 'WordPress theme ZIP file',
        },
      },
    },
  })
  async convertTheme(
    @UploadedFile() file: any,
  ): Promise<ConversionResult> {
    if (!file) {
      throw new BadRequestException('No theme file uploaded');
    }

    try {
      const result = await this.themeConverterService.convertTheme(file.path);
      
      // Cleanup uploaded file
      fs.unlinkSync(file.path);
      
      return result;
    } catch (error) {
      // Cleanup on error
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }
}
