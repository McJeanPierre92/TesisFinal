import { Module } from '@nestjs/common'
import { TermGradeController } from './term-grade.controller'
import { TermGradeService } from './term-grade.service'

@Module({
  controllers: [TermGradeController],
  providers: [TermGradeService],
  exports: [TermGradeService]
})
export class TermGradeModule {}
