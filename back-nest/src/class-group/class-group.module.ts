import { Module } from '@nestjs/common'
import { ClassGroupController } from './class-group.controller'
import { ClassGroupService } from './class-group.service'

@Module({
  controllers: [ClassGroupController],
  providers: [ClassGroupService],
  exports: [ClassGroupService]
})
export class ClassGroupModule {}
