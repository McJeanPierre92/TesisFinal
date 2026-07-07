/* eslint-disable */
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// Módulos académicos con sus acciones CRUD (+ acciones especiales de academic)
const CRUD_MODULES = [
  'institution',
  'level',
  'subject',
  'class-group',
  'enrollment',
  'teaching-assignment',
  'lesson',
  'task',
  'schedule',
  'submission',
  'grade',
  'term-grade'
] as const

const CRUD_ACTIONS = ['create', 'read', 'update', 'delete'] as const

// Permisos específicos del módulo academic (no son CRUD estándar)
const ACADEMIC_PERMISSIONS = [
  'academic:student-read', // alumno: ver sus clases, tareas, notas
  'academic:teacher-read', // profesor: ver sus asignaciones y entregas
  'academic:submit-task' // alumno: entregar una tarea
] as const

function permName(module: string, action: string) {
  return `${module}:${action}`
}

async function main() {
  console.log('🌱 Iniciando seed...')

  // ---------- 1. ROLES ----------
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' }
  })
  const teacherRole = await prisma.role.upsert({
    where: { name: 'profesor' },
    update: {},
    create: { name: 'profesor' }
  })
  const studentRole = await prisma.role.upsert({
    where: { name: 'alumno' },
    update: {},
    create: { name: 'alumno' }
  })
  console.log(`✅ Roles: admin(#${adminRole.id}), profesor(#${teacherRole.id}), alumno(#${studentRole.id})`)

  // ---------- 2. PERMISOS ----------
  const permissionNames: string[] = []
  for (const mod of CRUD_MODULES) {
    for (const action of CRUD_ACTIONS) {
      permissionNames.push(permName(mod, action))
    }
  }
  permissionNames.push(...ACADEMIC_PERMISSIONS)

  const permissionIds = new Map<string, number>()
  for (const name of permissionNames) {
    const p = await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name }
    })
    permissionIds.set(name, p.id)
  }
  console.log(`✅ ${permissionNames.length} permisos creados`)

  // ---------- 3. ASIGNACIÓN DE PERMISOS POR ROL ----------
  // ADMIN: todos los permisos
  await prisma.rolePermission.deleteMany({
    where: { roleId: adminRole.id }
  })
  await prisma.rolePermission.createMany({
    data: permissionNames.map((name) => ({
      roleId: adminRole.id,
      permissionId: permissionIds.get(name)!
    }))
  })

  // PROFESOR: lectura de todo + gestionar material propio + calificar
  const teacherPerms = [
    // lectura de toda la estructura
    ...CRUD_MODULES.map((m) => permName(m, 'read')),
    // gestión de material (solo de sus asignaciones, validado en academic.service)
    'lesson:create',
    'lesson:update',
    'lesson:delete',
    'task:create',
    'task:update',
    'task:delete',
    // calificación
    'grade:create',
    'grade:update',
    'term-grade:create',
    'term-grade:update',
    'enrollment:create',
    // acceso a sus vistas de profesor
    'academic:teacher-read'
  ]
  await prisma.rolePermission.deleteMany({
    where: { roleId: teacherRole.id }
  })
  await prisma.rolePermission.createMany({
    data: teacherPerms.map((name) => ({
      roleId: teacherRole.id,
      permissionId: permissionIds.get(name)!
    }))
  })

  // ALUMNO: lectura de su contexto + entregar tareas + ver sus notas
  const studentPerms = [
    'academic:student-read',
    'academic:submit-task'
  ]
  await prisma.rolePermission.deleteMany({
    where: { roleId: studentRole.id }
  })
  await prisma.rolePermission.createMany({
    data: studentPerms.map((name) => ({
      roleId: studentRole.id,
      permissionId: permissionIds.get(name)!
    }))
  })
  console.log('✅ Permisos asignados a los 3 roles')

  // ---------- 4. USUARIOS DE PRUEBA ----------
  const hashedPassword = await bcrypt.hash('123456', 10)

  const adminUser = await prisma.user.upsert({
    where: { userName: 'admin' },
    update: {},
    create: {
      name: 'Administrador',
      userName: 'admin',
      password: hashedPassword,
      roleId: adminRole.id
    }
  })

  const teacherUser = await prisma.user.upsert({
    where: { userName: 'profesor' },
    update: {},
    create: {
      name: 'Profesor Demo',
      userName: 'profesor',
      password: hashedPassword,
      roleId: teacherRole.id
    }
  })

  const studentUser = await prisma.user.upsert({
    where: { userName: 'alumno' },
    update: {},
    create: {
      name: 'Alumno Demo',
      userName: 'alumno',
      password: hashedPassword,
      roleId: studentRole.id
    }
  })
  console.log(
    `✅ Usuarios: admin(#${adminUser.id}), profesor(#${teacherUser.id}), alumno(#${studentUser.id}) — password "123456"`
  )

  // ---------- 5. DATOS ACADÉMICOS DEMO (sistema vivo) ----------
  const institution = await prisma.institution.upsert({
    where: { name: 'ULEAM' },
    update: {},
    create: {
      name: 'ULEAM',
      description: 'Universidad Laica Eloy Alfaro de Manabí'
    }
  })

  // --- Niveles (varios) ---
  const levelNames = [
    { name: '7mo', order: 7 },
    { name: '8vo', order: 8 },
    { name: '9no', order: 9 }
  ]
  const levels: Record<string, { id: number }> = {}
  for (const lv of levelNames) {
    const existing = await prisma.level.findFirst({
      where: { name: lv.name, institutionId: institution.id }
    })
    const level =
      existing ??
      (await prisma.level.create({
        data: { ...lv, institutionId: institution.id }
      }))
    levels[lv.name] = { id: level.id }
  }

  // --- Paralelos (8vo A y 8vo B) ---
  const classGroups: Record<string, { id: number }> = {}
  for (const parallel of ['A', 'B']) {
    const cg = await prisma.classGroup.upsert({
      where: {
        levelId_parallel: {
          levelId: levels['8vo'].id,
          parallel
        }
      },
      update: {},
      create: {
        parallel,
        levelId: levels['8vo'].id,
        institutionId: institution.id
      }
    })
    classGroups[parallel] = { id: cg.id }
  }

  // --- Materias ---
  const subjectNames = [
    'Matemáticas',
    'Lenguaje y Comunicación',
    'Ciencias Naturales',
    'Estudios Sociales',
    'Inglés'
  ]
  const subjects: Record<string, { id: number }> = {}
  for (const name of subjectNames) {
    const subj = await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name, institutionId: institution.id }
    })
    subjects[name] = { id: subj.id }
  }

  // --- Profesores adicionales (uno por materia para 8vo A) ---
  const teacherNames = [
    { name: 'Prof. María Pérez', userName: 'mperez' },
    { name: 'Prof. Juan Loor', userName: 'jloor' },
    { name: 'Prof. Ana Mendoza', userName: 'amendoza' },
    { name: 'Prof. Carlos Vera', userName: 'cvera' },
    { name: 'Prof. Lucía Torres', userName: 'ltorres' }
  ]
  const extraTeachers: number[] = []
  for (const t of teacherNames) {
    const u = await prisma.user.upsert({
      where: { userName: t.userName },
      update: {},
      create: {
        name: t.name,
        userName: t.userName,
        password: hashedPassword,
        roleId: teacherRole.id
      }
    })
    extraTeachers.push(u.id)
  }

  // Asignaciones: cada materia de 8vo A con un profesor distinto.
  // La materia 0 (Matemáticas) queda para el profesor demo 'profesor'.
  const assignments: Record<string, { id: number; teacherId: number }> = {}
  const assignmentPlan = subjectNames.map((subj, i) => ({
    subject: subj,
    teacherId: i === 0 ? teacherUser.id : extraTeachers[i]
  }))

  for (const plan of assignmentPlan) {
    const ta = await prisma.teachingAssignment.upsert({
      where: {
        subjectId_classGroupId: {
          subjectId: subjects[plan.subject].id,
          classGroupId: classGroups['A'].id
        }
      },
      update: {},
      create: {
        subjectId: subjects[plan.subject].id,
        classGroupId: classGroups['A'].id,
        teacherId: plan.teacherId
      }
    })
    assignments[plan.subject] = { id: ta.id, teacherId: plan.teacherId }
  }

  // --- Alumnos del paralelo 8vo A (7 adicionales + el demo) ---
  const studentNames = [
    { name: 'Alumno Demo', userName: 'alumno' }, // ya existe
    { name: 'Gabriel Salinas', userName: 'gsalinas' },
    { name: 'Valeria Mendoza', userName: 'vmendoza' },
    { name: 'Diego Cedeño', userName: 'dcedenyo' },
    { name: 'Camila Ribadeneira', userName: 'cribadeneira' },
    { name: 'Mateo García', userName: 'mgarcia' },
    { name: 'Sofía Pinto', userName: 'spinto' },
    { name: 'Tomás Briones', userName: 'tbriones' }
  ]
  const studentIds: number[] = []
  for (const s of studentNames) {
    const u = await prisma.user.upsert({
      where: { userName: s.userName },
      update: {},
      create: {
        name: s.name,
        userName: s.userName,
        password: hashedPassword,
        roleId: studentRole.id
      }
    })
    studentIds.push(u.id)
    // Matricular en 8vo A
    await prisma.enrollment.upsert({
      where: {
        classGroupId_studentId: {
          classGroupId: classGroups['A'].id,
          studentId: u.id
        }
      },
      update: {},
      create: { classGroupId: classGroups['A'].id, studentId: u.id }
    })
  }

  // --- Horarios completos para TODAS las materias de 8vo A ---
  const horariosPorMateria: Record<string, { day: any; start: string; end: string }[]> = {
    Matemáticas: [
      { day: 'lunes', start: '07:00:00', end: '08:30:00' },
      { day: 'miercoles', start: '07:00:00', end: '08:30:00' },
      { day: 'viernes', start: '09:00:00', end: '10:30:00' }
    ],
    'Lenguaje y Comunicación': [
      { day: 'martes', start: '07:00:00', end: '08:30:00' },
      { day: 'jueves', start: '07:00:00', end: '08:30:00' }
    ],
    'Ciencias Naturales': [
      { day: 'lunes', start: '09:00:00', end: '10:30:00' },
      { day: 'miercoles', start: '09:00:00', end: '10:30:00' }
    ],
    'Estudios Sociales': [
      { day: 'martes', start: '09:00:00', end: '10:30:00' },
      { day: 'viernes', start: '07:00:00', end: '08:30:00' }
    ],
    Inglés: [
      { day: 'jueves', start: '09:00:00', end: '10:30:00' },
      { day: 'viernes', start: '11:00:00', end: '12:30:00' }
    ]
  }

  for (const [subjectName, bloques] of Object.entries(horariosPorMateria)) {
    const ta = assignments[subjectName]
    if (!ta) continue
    for (const b of bloques) {
      const exists = await prisma.schedule.findFirst({
        where: {
          teachingAssignmentId: ta.id,
          dayOfWeek: b.day,
          startTime: new Date(`1970-01-01T${b.start}Z`)
        }
      })
      if (!exists) {
        await prisma.schedule.create({
          data: {
            teachingAssignmentId: ta.id,
            dayOfWeek: b.day,
            startTime: new Date(`1970-01-01T${b.start}Z`),
            endTime: new Date(`1970-01-01T${b.end}Z`)
          }
        })
      }
    }
  }
  console.log(`✅ Horarios creados para las 5 materias de 8vo A`)

  // --- Contenido académico: lecciones + tareas por materia ---
  type ContentSeed = {
    subject: string
    lessons: { title: string; content?: string }[]
    tasks: {
      title: string
      description: string
      maxScore: number
      lessonIndex: number
    }[]
  }

  const contentSeeds: ContentSeed[] = [
    {
      subject: 'Matemáticas',
      lessons: [
        {
          title: 'Unidad 1: Números enteros',
          content:
            'Definición, propiedades y operaciones básicas con números enteros positivos y negativos.'
        },
        {
          title: 'Unidad 2: Fracciones',
          content:
            'Concepto de fracción, operaciones (suma, resta, multiplicación y división) y problemas aplicados.'
        },
        {
          title: 'Unidad 3: Álgebra básica',
          content: 'Introducción a las variables, ecuaciones de primer grado.'
        }
      ],
      tasks: [
        {
          title: 'Tarea 1: Operaciones con enteros',
          description: 'Resolver los ejercicios del 1 al 10 de la guía.',
          maxScore: 10,
          lessonIndex: 0
        },
        {
          title: 'Tarea 2: Suma de fracciones',
          description: 'Resolver 5 ejercicios propuestos de fracciones heterogéneas.',
          maxScore: 10,
          lessonIndex: 1
        },
        {
          title: 'Examen parcial: Unidades 1 y 2',
          description: 'Evaluación individual sobre enteros y fracciones.',
          maxScore: 20,
          lessonIndex: 1
        }
      ]
    },
    {
      subject: 'Lenguaje y Comunicación',
      lessons: [
        { title: 'La narración', content: 'Estructura del texto narrativo.' },
        { title: 'El ensayo', content: 'Cómo redactar un ensayo argumentativo.' }
      ],
      tasks: [
        {
          title: 'Ensayo: Mi experiencia en la escuela',
          description: 'Redactar un ensayo de 500 palabras.',
          maxScore: 15,
          lessonIndex: 1
        }
      ]
    },
    {
      subject: 'Ciencias Naturales',
      lessons: [
        { title: 'La célula', content: 'Estructura y función celular.' },
        { title: 'Ecosistemas', content: 'Cadenas alimenticias y equilibrio.' }
      ],
      tasks: [
        {
          title: 'Informe: Observación de una célula',
          description: 'Realizar un dibujo y descripción.',
          maxScore: 10,
          lessonIndex: 0
        }
      ]
    },
    {
      subject: 'Estudios Sociales',
      lessons: [{ title: 'Independencia del Ecuador', content: 'Causas y consecuencias.' }],
      tasks: [
        {
          title: 'Mapa conceptual: Independencia',
          description: 'Sintetizar causas, hechos y consecuencias.',
          maxScore: 10,
          lessonIndex: 0
        }
      ]
    },
    {
      subject: 'Inglés',
      lessons: [{ title: 'Present Simple', content: 'Uso y estructura del presente simple.' }],
      tasks: [
        {
          title: 'Worksheet: Daily routine',
          description: 'Escribe 10 oraciones sobre tu rutina diaria en presente simple.',
          maxScore: 10,
          lessonIndex: 0
        }
      ]
    }
  ]

  // Helper para crear lección si no existe (por título + asignación)
  const getOrCreateLesson = async (
    teachingAssignmentId: number,
    title: string,
    content: string | undefined,
    order: number
  ) => {
    const existing = await prisma.lesson.findFirst({
      where: { teachingAssignmentId, title }
    })
    if (existing) return existing
    return prisma.lesson.create({
      data: { teachingAssignmentId, title, content, order }
    })
  }

  // Crear contenido
  const taskIdsBySubject: Record<string, number[]> = {}
  for (const seed of contentSeeds) {
    const ta = assignments[seed.subject]
    if (!ta) continue
    const lessonIds: number[] = []
    for (let i = 0; i < seed.lessons.length; i++) {
      const lesson = await getOrCreateLesson(
        ta.id,
        seed.lessons[i].title,
        seed.lessons[i].content,
        i + 1
      )
      lessonIds.push(lesson.id)
    }
    const taskIds: number[] = []
    for (const t of seed.tasks) {
      const existing = await prisma.task.findFirst({
        where: { teachingAssignmentId: ta.id, title: t.title }
      })
      if (existing) {
        taskIds.push(existing.id)
        continue
      }
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 7 + t.lessonIndex * 3)
      const task = await prisma.task.create({
        data: {
          teachingAssignmentId: ta.id,
          lessonId: lessonIds[t.lessonIndex],
          title: t.title,
          description: t.description,
          maxScore: t.maxScore,
          dueDate
        }
      })
      taskIds.push(task.id)
    }
    taskIdsBySubject[seed.subject] = taskIds
  }

  // --- Examen (cuestionario) de Matemáticas para que el alumno lo vea ---
  const mathTa = assignments['Matemáticas']
  if (mathTa) {
    const existingQuiz = await prisma.task.findFirst({
      where: { teachingAssignmentId: mathTa.id, title: 'Examen: Números enteros' }
    })
    if (!existingQuiz) {
      const quiz = await prisma.task.create({
        data: {
          teachingAssignmentId: mathTa.id,
          title: 'Examen: Números enteros',
          description: 'Cuestionario auto-calificable sobre operaciones con enteros.',
          type: 'examen',
          maxScore: 10,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          questions: {
            create: [
              {
                text: '¿Cuánto es -5 + 8?',
                order: 0,
                options: {
                  create: [
                    { text: '3', isCorrect: true, order: 0 },
                    { text: '-3', isCorrect: false, order: 1 },
                    { text: '13', isCorrect: false, order: 2 }
                  ]
                }
              },
              {
                text: '¿Cuánto es -4 × -3?',
                order: 1,
                options: {
                  create: [
                    { text: '-12', isCorrect: false, order: 0 },
                    { text: '12', isCorrect: true, order: 1 },
                    { text: '7', isCorrect: false, order: 2 }
                  ]
                }
              },
              {
                text: '¿Cuánto es 15 ÷ (-3)?',
                order: 2,
                options: {
                  create: [
                    { text: '5', isCorrect: false, order: 0 },
                    { text: '-5', isCorrect: true, order: 1 },
                    { text: '-12', isCorrect: false, order: 2 }
                  ]
                }
              },
              {
                text: '¿Cuál es el opuesto de -7?',
                order: 3,
                options: {
                  create: [
                    { text: '-7', isCorrect: false, order: 0 },
                    { text: '0', isCorrect: false, order: 1 },
                    { text: '7', isCorrect: true, order: 2 }
                  ]
                }
              },
              {
                text: '¿Cuánto es (-2)³?',
                order: 4,
                options: {
                  create: [
                    { text: '-8', isCorrect: true, order: 0 },
                    { text: '8', isCorrect: false, order: 1 },
                    { text: '-6', isCorrect: false, order: 2 }
                  ]
                }
              }
            ]
          }
        },
        include: { questions: { include: { options: true } } }
      })
      console.log(`✅ Examen creado: "${quiz.title}" con ${quiz.questions.length} preguntas`)
      // Añadir el id del examen al array de tareas de Matemáticas
      taskIdsBySubject['Matemáticas'] = [...(taskIdsBySubject['Matemáticas'] ?? []), quiz.id]
    }
  }

  // --- Entregas + notas ya calificadas (para que el alumno vea notas reales) ---
  // El alumno demo entrega y se califica las primeras 2 tareas de Matemáticas.
  const mathTaskIds = taskIdsBySubject['Matemáticas'] ?? []
  const demoStudentId = studentIds[0] // 'alumno'
  const mathTeacherId = assignments['Matemáticas'].teacherId

  if (mathTaskIds.length >= 2) {
    // Tarea 1: entregada y calificada
    const t1 = await prisma.submission.upsert({
      where: { taskId_studentId: { taskId: mathTaskIds[0], studentId: demoStudentId } },
      update: {},
      create: {
        taskId: mathTaskIds[0],
        studentId: demoStudentId,
        fileUrl: '/uploads/demo-tarea1.pdf',
        comment: 'Aquí están los ejercicios resueltos.',
        status: 'calificada',
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    })
    await prisma.grade.upsert({
      where: { submissionId: t1.id },
      update: {},
      create: {
        submissionId: t1.id,
        score: 9,
        feedback: 'Buen trabajo. Revisar el ejercicio 7.',
        gradedById: mathTeacherId
      }
    })

    // Tarea 2: entregada, pendiente de calificar
    await prisma.submission.upsert({
      where: { taskId_studentId: { taskId: mathTaskIds[1], studentId: demoStudentId } },
      update: {},
      create: {
        taskId: mathTaskIds[1],
        studentId: demoStudentId,
        fileUrl: '/uploads/demo-tarea2.pdf',
        comment: 'Espero sus observaciones.',
        status: 'entregada',
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    })
  }

  // Entregas de OTROS alumnos en la tarea 1 de Matemáticas (para que el profesor vea cola de calificación)
  const otherStudents = studentIds.slice(1)
  for (let i = 0; i < Math.min(otherStudents.length, 4); i++) {
    const sid = otherStudents[i]
    if (mathTaskIds.length === 0) break
    await prisma.submission.upsert({
      where: { taskId_studentId: { taskId: mathTaskIds[0], studentId: sid } },
      update: {},
      create: {
        taskId: mathTaskIds[0],
        studentId: sid,
        comment: `Entrega del estudiante ${i + 1}.`,
        status: i < 2 ? 'entregada' : 'pendiente',
        submittedAt: new Date(Date.now() - (i + 1) * 12 * 60 * 60 * 1000)
      }
    })
  }

  // --- Nota de parcial ya registrada para el alumno demo en Matemáticas ---
  await prisma.termGrade.upsert({
    where: {
      teachingAssignmentId_studentId_term: {
        teachingAssignmentId: assignments['Matemáticas'].id,
        studentId: demoStudentId,
        term: 'primerParcial'
      }
    },
    update: {},
    create: {
      teachingAssignmentId: assignments['Matemáticas'].id,
      studentId: demoStudentId,
      term: 'primerParcial',
      score: 8.5,
      observations: 'Buen desempeño general, mejorar fracciones.'
    }
  })

  console.log(
    `✅ Datos demo completos: 3 niveles, 2 paralelos (8vo A/B), 5 materias, 5 profesores + profesor demo, 8 alumnos, lecciones/tareas por materia, entregas y notas calificadas.`
  )

  console.log(
    `✅ Datos demo: institución ULEAM, nivel 8vo, paralelo A, materia Matemáticas, 1 lección + 1 tarea`
  )

  // ---------- 6. MENÚS LMS (menuSection + menuSectionPermission) ----------
  // El AuthContext del frontend valida la ruta actual contra las menuSections
  // asignadas al rol del usuario. Sin estas entradas, /lms redirige.
  const lmsMenus = [
    {
      key: 'lms-dashboard',
      label: 'Dashboard',
      href: '/lms',
      icon: 'LayoutDashboard',
      order: 1
    },
    {
      key: 'lms-my-courses',
      label: 'Mis Cursos',
      href: '/lms/my-courses',
      icon: 'BookOpen',
      order: 2
    },
    {
      key: 'lms-my-grades',
      label: 'Mis Notas',
      href: '/lms/my-grades',
      icon: 'GraduationCap',
      order: 3
    },
    {
      key: 'lms-my-schedule',
      label: 'Mi Horario',
      href: '/lms/my-schedule',
      icon: 'CalendarDays',
      order: 4
    },
    {
      key: 'lms-teacher-assignments',
      label: 'Mis Clases',
      href: '/lms/teacher/assignments',
      icon: 'ClipboardList',
      order: 5
    },
    {
      key: 'lms-teacher-schedule',
      label: 'Mi Horario',
      href: '/lms/teacher/schedule',
      icon: 'CalendarDays',
      order: 6
    },
    {
      key: 'lms-teacher-grading',
      label: 'Calificar',
      href: '/lms/teacher/grading',
      icon: 'ClipboardCheck',
      order: 5
    },
    {
      key: 'lms-admin-academic',
      label: 'Gestión Académica',
      href: '/lms/admin',
      icon: 'Building2',
      order: 6
    },
    {
      key: 'lms-admin-institutions',
      label: 'Instituciones',
      href: '/lms/admin/institutions',
      icon: 'Building2',
      order: 7
    },
    {
      key: 'lms-admin-levels',
      label: 'Niveles',
      href: '/lms/admin/levels',
      icon: 'Layers',
      order: 8
    },
    {
      key: 'lms-admin-subjects',
      label: 'Materias',
      href: '/lms/admin/subjects',
      icon: 'BookOpen',
      order: 9
    },
    {
      key: 'lms-admin-class-groups',
      label: 'Paralelos',
      href: '/lms/admin/class-groups',
      icon: 'Network',
      order: 10
    },
    {
      key: 'lms-admin-students',
      label: 'Estudiantes',
      href: '/lms/admin/students',
      icon: 'UsersRound',
      order: 11
    },
    {
      key: 'lms-admin-teachers',
      label: 'Profesores',
      href: '/lms/admin/teachers',
      icon: 'UserCog',
      order: 12
    },
    {
      key: 'lms-admin-enrollments',
      label: 'Matrículas',
      href: '/lms/admin/enrollments',
      icon: 'GraduationCap',
      order: 13
    },
    {
      key: 'lms-admin-teaching-assignments',
      label: 'Asignaciones',
      href: '/lms/admin/teaching-assignments',
      icon: 'ClipboardList',
      order: 14
    },
    {
      key: 'lms-admin-schedule',
      label: 'Horarios',
      href: '/lms/admin/schedule',
      icon: 'CalendarDays',
      order: 15
    },
    {
      key: 'lms-profile',
      label: 'Mi Perfil',
      href: '/lms/profile',
      icon: 'UserCog',
      order: 99
    }
  ]

  const menuIds = new Map<string, number>()
  for (const m of lmsMenus) {
    const created = await prisma.menuSection.upsert({
      where: { key: m.key },
      update: {},
      create: m
    })
    menuIds.set(m.key, created.id)
  }

  // Asignación por rol:
  //  - alumno: dashboard, mis-cursos, mis-notas
  //  - profesor: dashboard, mis-clases, calificar
  //  - admin: dashboard + las secciones de gestión académica directas
  const adminMenuKeys = [
    'lms-dashboard',
    'lms-admin-institutions',
    'lms-admin-levels',
    'lms-admin-subjects',
    'lms-admin-class-groups',
    'lms-admin-students',
    'lms-admin-teachers',
    'lms-admin-enrollments',
    'lms-admin-teaching-assignments',
    'lms-admin-schedule'
  ]
  const roleMenus: Record<string, string[]> = {
    [studentRole.name]: [
      'lms-dashboard',
      'lms-my-courses',
      'lms-my-schedule',
      'lms-my-grades',
      'lms-profile'
    ],
    [teacherRole.name]: [
      'lms-dashboard',
      'lms-teacher-assignments',
      'lms-teacher-schedule',
      'lms-teacher-grading',
      'lms-profile'
    ],
    [adminRole.name]: [...adminMenuKeys, 'lms-profile']
  }

  for (const [roleName, menuKeys] of Object.entries(roleMenus)) {
    const role =
      roleName === adminRole.name
        ? adminRole
        : roleName === teacherRole.name
          ? teacherRole
          : studentRole

    // Limpia TODOS los permisos de menú previos del rol (para que un re-seed
    // no deje menús huérfanos de una configuración anterior).
    await prisma.menuSectionPermission.deleteMany({
      where: { roleId: role.id }
    })

    await prisma.menuSectionPermission.createMany({
      data: menuKeys.map((k) => ({
        roleId: role.id,
        menuSectionId: menuIds.get(k)!
      }))
    })
  }
  console.log(`✅ ${lmsMenus.length} menús LMS creados y asignados a los roles`)

  console.log('🎉 Seed completado.')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
