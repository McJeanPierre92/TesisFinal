import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger'
import { diskStorage } from 'multer'
import { rename } from 'node:fs/promises'
import { join } from 'node:path'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import {
  ALLOWED_SUBMISSION_MIMES,
  MAX_SUBMISSION_SIZE,
  UploadsService
} from './uploads.service'

const UPLOADS_DIR = join(process.cwd(), 'uploads')

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('submission-file')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiOkResponse({
    description: 'URL pública del archivo subido',
    schema: {
      type: 'object',
      properties: {
        fileUrl: { type: 'string', example: '/uploads/2-12345-tarea.pdf' }
      }
    }
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (_req, file, cb) => cb(null, file.originalname)
      }),
      limits: { fileSize: MAX_SUBMISSION_SIZE },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_SUBMISSION_MIMES.includes(file.mimetype)) {
          cb(null, true)
        } else {
          cb(
            new BadRequestException(
              `Tipo de archivo no permitido: ${file.mimetype}`
            ),
            false
          )
        }
      }
    })
  )
  async uploadSubmissionFile(
    @CurrentUser() user: { id: number },
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo')
    }

    // Renombramos en disco al nombre canónico (userId-timestamp-base.ext)
    const fileName = this.uploadsService.buildSubmissionFileName(
      user.id,
      file.originalname
    )
    const finalPath = join(UPLOADS_DIR, fileName)
    await rename(file.path, finalPath)

    const fileUrl = this.uploadsService.buildPublicUrl(fileName)

    return {
      fileUrl,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }
  }
}
