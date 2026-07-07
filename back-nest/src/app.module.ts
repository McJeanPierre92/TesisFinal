import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod
} from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import { ThrottlerModule, seconds } from '@nestjs/throttler'
import { join } from 'node:path'
import { AcademicModule } from './academic/academic.module'
import { AuthModule } from './auth/auth.module'
import { ClassGroupModule } from './class-group/class-group.module'
import { EnrollmentModule } from './enrollment/enrollment.module'
import { GradeModule } from './grade/grade.module'
import { InstitutionModule } from './institution/institution.module'
import { LessonModule } from './lesson/lesson.module'
import { LevelModule } from './level/level.module'
import { ScheduleModule } from './schedule/schedule.module'
import { SubjectModule } from './subject/subject.module'
import { SubmissionModule } from './submission/submission.module'
import { TaskModule } from './task/task.module'
import { TeachingAssignmentModule } from './teaching-assignment/teaching-assignment.module'
import { TermGradeModule } from './term-grade/term-grade.module'
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard'
import { TransformDecimalsInterceptor } from './common/interceptors/transform-decimals.interceptor'
import { MenuSectionPermissionModule } from './menu-section-permission/menu-section-permission.module'
import { MenuSectionModule } from './menu-section/menu-section.module'
import { AuditLoggerMiddleware } from './middleware/audit-logger.middleware'
import { NotFoundFilter } from './middleware/notFound.filter'
import { PermissionModule } from './permission/permission.module'
import { RolePermissionModule } from './role-permission/role-permission.module'
import { RoleModule } from './role/role.module'
import { PrismaModule } from './storage/postgres/prisma.module'
import { UploadsModule } from './uploads/uploads.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads'
    }),
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ThrottlerModule.forRoot([
      {
        ttl: seconds(60),
        limit: 30,
        name: 'short'
      },
      {
        ttl: seconds(3600),
        limit: 500,
        name: 'long'
      }
    ]),
    UserModule,
    AuthModule,
    RoleModule,
    PermissionModule,
    MenuSectionModule,
    MenuSectionPermissionModule,
    RolePermissionModule,
    // Módulos académicos (LMS)
    InstitutionModule,
    LevelModule,
    SubjectModule,
    ClassGroupModule,
    EnrollmentModule,
    TeachingAssignmentModule,
    LessonModule,
    TaskModule,
    ScheduleModule,
    SubmissionModule,
    GradeModule,
    TermGradeModule,
    AcademicModule,
    UploadsModule,
    PrismaModule
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: NotFoundFilter
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformDecimalsInterceptor
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuditLoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
