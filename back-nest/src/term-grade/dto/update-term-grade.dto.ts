import { PartialType } from '@nestjs/swagger'
import { CreateTermGradeDto } from './create-term-grade.dto'

export class UpdateTermGradeDto extends PartialType(CreateTermGradeDto) {}
