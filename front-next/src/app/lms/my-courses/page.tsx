'use client'

import { Card, CardContent } from '@/components/ui/card'
import { apiAcademic } from '@/modules/academic/infrastructure/apiAcademic'
import { getSubjectColor } from '@/constants/subjectColors'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { PageHeader } from '@/section/lms/components/PageHeader'
import { Avatar } from '@/section/lms/components/Avatar'
import { EmptyState } from '@/section/lms/components/EmptyState'
import { AnimatedGrid, AnimatedItem } from '@/section/lms/components/AnimatedGrid'
import { MyEnrollment } from '@/modules/academic/domain/academic'

const academicApi = apiAcademic()

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<MyEnrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    academicApi
      .getMyClasses()
      .then(setEnrollments)
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false))
  }, [])

  const courses = enrollments.flatMap((e) =>
    (e.classGroup.teachingAssignments ?? []).map((ta) => ({
      id: ta.id,
      subjectName: ta.subject.name,
      teacherName: ta.teacher.name,
      levelName: e.classGroup.level?.name ?? '',
      parallel: e.classGroup.parallel,
      lessons: (ta as any)._count?.lessons ?? 0,
      tasks: (ta as any)._count?.tasks ?? 0
    }))
  )

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={BookOpen}
        title='Mis Cursos'
        subtitle='Materias en las que estás matriculado'
        tone='info'
      />

      {loading ? (
        <div className='flex items-center justify-center py-20'>
          <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title='No estás matriculado en materias'
          description='Contacta con tu profesor o administrador para que te matricule.'
        />
      ) : (
        <AnimatedGrid className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {courses.map((course) => {
            const color = getSubjectColor(course.subjectName)
            return (
              <AnimatedItem key={course.id}>
                <Link href={`/lms/my-courses/${course.id}`}>
                  <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <Card className='overflow-hidden hover:shadow-lg transition-shadow h-full'>
                      {/* Banda de color superior */}
                      <div className={`h-2 ${color.solid}`} />
                      <CardContent className='p-5'>
                        <div className='flex items-start gap-3'>
                          <div
                            className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${color.tile}`}
                          >
                            <BookOpen className='w-6 h-6' />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <h3 className='font-semibold text-foreground truncate'>
                              {course.subjectName}
                            </h3>
                            <span className='text-xs text-muted-foreground'>
                              {course.levelName} {course.parallel}
                            </span>
                          </div>
                        </div>

                        {/* Profesor */}
                        <div className='flex items-center gap-2 mt-4 pt-3 border-t border-border'>
                          <Avatar name={course.teacherName} size='sm' />
                          <span className='text-sm text-muted-foreground truncate'>
                            {course.teacherName}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </AnimatedItem>
            )
          })}
        </AnimatedGrid>
      )}
    </div>
  )
}
