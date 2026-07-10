import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateAnnouncementByTeacherDto {
  @ApiProperty({ type: Number })
  @IsInt()
  @IsNotEmpty()
  teachingAssignmentId: number

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  content?: string
}
