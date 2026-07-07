import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { PermissionsGuard, RequirePermission } from 'src/common/guards/guard'
import { AcademicService } from './academic.service'
import { CreateGradeByTeacherDto } from './dto/create-grade-by-teacher.dto'
import { CreateLessonByTeacherDto } from './dto/create-lesson-by-teacher.dto'
import { CreateSubmissionByStudentDto } from './dto/create-submission-by-student.dto'
import { CreateTaskByTeacherDto } from './dto/create-task-by-teacher.dto'
import { CreateTermGradeByTeacherDto } from './dto/create-term-grade-by-teacher.dto'

@ApiTags('academic')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('academic')
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  // ---------------- ALUMNO ----------------

  @Get('my-classes')
  @RequirePermission('academic', 'student-read')
  findMyClasses(@CurrentUser('id') studentId: number) {
    return this.academicService.findMyClasses(studentId)
  }

  @Get('my-tasks')
  @RequirePermission('academic', 'student-read')
  findMyTasks(@CurrentUser('id') studentId: number) {
    return this.academicService.findMyTasks(studentId)
  }

  @Get('my-grades')
  @RequirePermission('academic', 'student-read')
  findMyGrades(@CurrentUser('id') studentId: number) {
    return this.academicService.findMyGrades(studentId)
  }

  @Post('submissions/:taskId')
  @RequirePermission('academic', 'submit-task')
  submitTask(
    @CurrentUser('id') studentId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: CreateSubmissionByStudentDto
  ) {
    return this.academicService.submitTask(studentId, taskId, dto)
  }

  // ---------------- PROFESOR ----------------

  @Get('teacher/assignments')
  @RequirePermission('academic', 'teacher-read')
  findTeacherAssignments(@CurrentUser('id') teacherId: number) {
    return this.academicService.findTeacherAssignments(teacherId)
  }

  @Post('teacher/lessons')
  @RequirePermission('lesson', 'create')
  createLessonByTeacher(
    @CurrentUser('id') teacherId: number,
    @Body() dto: CreateLessonByTeacherDto
  ) {
    return this.academicService.createLessonByTeacher(teacherId, dto)
  }

  @Post('teacher/tasks')
  @RequirePermission('task', 'create')
  createTaskByTeacher(
    @CurrentUser('id') teacherId: number,
    @Body() dto: CreateTaskByTeacherDto
  ) {
    return this.academicService.createTaskByTeacher(teacherId, dto)
  }

  @Get('teacher/submissions/:taskId')
  @RequirePermission('academic', 'teacher-read')
  findSubmissionsForTeacherTask(
    @CurrentUser('id') teacherId: number,
    @Param('taskId', ParseIntPipe) taskId: number
  ) {
    return this.academicService.findSubmissionsForTeacherTask(
      teacherId,
      taskId
    )
  }

  @Post('teacher/grades/:submissionId')
  @RequirePermission('grade', 'create')
  gradeSubmission(
    @CurrentUser('id') teacherId: number,
    @Param('submissionId', ParseIntPipe) submissionId: number,
    @Body() dto: CreateGradeByTeacherDto
  ) {
    return this.academicService.gradeSubmission(
      teacherId,
      submissionId,
      dto
    )
  }

  @Post('teacher/term-grades')
  @RequirePermission('term-grade', 'create')
  createTermGradeByTeacher(
    @CurrentUser('id') teacherId: number,
    @Body() dto: CreateTermGradeByTeacherDto
  ) {
    return this.academicService.createTermGradeByTeacher(teacherId, dto)
  }

  // ---------------- LECCIONES Y TAREAS (lectura + edit/delete) ----------------

  @Get('my-lessons')
  @RequirePermission('academic', 'student-read')
  findMyLessons(@CurrentUser('id') studentId: number) {
    return this.academicService.findMyLessons(studentId)
  }

  @Get('teacher/lessons/:assignmentId')
  @RequirePermission('academic', 'teacher-read')
  findTeacherLessons(
    @CurrentUser('id') teacherId: number,
    @Param('assignmentId', ParseIntPipe) assignmentId: number
  ) {
    return this.academicService.findTeacherLessons(teacherId, assignmentId)
  }

  @Get('teacher/tasks/:assignmentId')
  @RequirePermission('academic', 'teacher-read')
  findTeacherTasks(
    @CurrentUser('id') teacherId: number,
    @Param('assignmentId', ParseIntPipe) assignmentId: number
  ) {
    return this.academicService.findTeacherTasks(teacherId, assignmentId)
  }

  @Patch('teacher/lessons/:id')
  @RequirePermission('lesson', 'update')
  updateLessonByTeacher(
    @CurrentUser('id') teacherId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateLessonByTeacherDto
  ) {
    return this.academicService.updateLessonByTeacher(teacherId, id, dto)
  }

  @Delete('teacher/lessons/:id')
  @RequirePermission('lesson', 'delete')
  deleteLessonByTeacher(
    @CurrentUser('id') teacherId: number,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.academicService.deleteLessonByTeacher(teacherId, id)
  }

  @Patch('teacher/tasks/:id')
  @RequirePermission('task', 'update')
  updateTaskByTeacher(
    @CurrentUser('id') teacherId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateTaskByTeacherDto
  ) {
    return this.academicService.updateTaskByTeacher(teacherId, id, dto)
  }

  @Delete('teacher/tasks/:id')
  @RequirePermission('task', 'delete')
  deleteTaskByTeacher(
    @CurrentUser('id') teacherId: number,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.academicService.deleteTaskByTeacher(teacherId, id)
  }
}
