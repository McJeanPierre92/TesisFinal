import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class CreateSubmissionByStudentDto {
  @ApiPropertyOptional({
    type: String,
    description: 'URL del archivo subido (para tareas tipo documento)'
  })
  @IsOptional()
  @IsString()
  fileUrl?: string

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  comment?: string

  @ApiPropertyOptional({
    description:
      'Respuestas del cuestionario: { questionId: optionId }. Solo para tareas tipo examen.'
  })
  @IsOptional()
  answers?: any
}
