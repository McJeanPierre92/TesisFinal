/* eslint-disable */
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// ============================================================
// DATOS DEL SISTEMA
// ============================================================

const CRUD_MODULES = [
  'institution', 'level', 'subject', 'class-group', 'enrollment',
  'teaching-assignment', 'lesson', 'task', 'schedule',
  'submission', 'grade', 'term-grade'
] as const

const CRUD_ACTIONS = ['create', 'read', 'update', 'delete'] as const

const ACADEMIC_PERMISSIONS = [
  'academic:student-read',
  'academic:teacher-read',
  'academic:submit-task'
] as const

function permName(module: string, action: string) {
  return `${module}:${action}`
}

// ============================================================
// NOMBRES ECUATORIANOS
// ============================================================

// 23 alumnos para Luis (8vo A)
const ALUMNOS_A = [
  { name: 'María Fernanda Cedeño Mendoza', userName: 'mfcedenyo' },
  { name: 'José David Intriago Zambrano', userName: 'jdintriago' },
  { name: 'Valentina Mieles Vera', userName: 'vmieles' },
  { name: 'Anthony Brayan Solórzano Ponce', userName: 'asolorzano' },
  { name: 'Camila Ribadeneira Garcés', userName: 'cribadeneira' },
  { name: 'Mateo Velásquez Castillo', userName: 'mvelasquez' },
  { name: 'Sofía Delgado Quiñonez', userName: 'sdelgado' },
  { name: 'Diego Alejandro Loor Macías', userName: 'daloor' },
  { name: 'Gabriela Mendoza Saltos', userName: 'gmendoza' },
  { name: 'Jean Carlos Pigua Mora', userName: 'jcpigua' },
  { name: 'Valery Mishell Anchundia Gómez', userName: 'vanchundia' },
  { name: 'Brayan Stalin Cevallos Vera', userName: 'bscevallos' },
  { name: 'Doménica Viteri Flores', userName: 'dviteri' },
  { name: 'Kevin Ariel Bermúdez Torres', userName: 'kabermudez' },
  { name: 'Melany Caicedo Rivas', userName: 'mcaicedo' },
  { name: 'Jordan Stiven Anchala Bravo', userName: 'jsanchala' },
  { name: 'Antonella Zambrano Ruiz', userName: 'azambrano' },
  { name: 'Cristopher Chila Llivipuma', userName: 'cchila' },
  { name: 'Ariadna Vera Tomalá', userName: 'avera' },
  { name: 'Renato Quiroz Pilay', userName: 'rquiroz' },
  { name: 'Nicole Salazar Cobos', userName: 'nsalazar' },
  { name: 'Anderson Mendoza Perlaza', userName: 'amendoza2' },
  { name: 'Genesis Michell Cárdenas Lucas', userName: 'gmcardenas' }
]

// 27 alumnos para Jorge (8vo B)
const ALUMNOS_B = [
  { name: 'Andrés Felipe Mendoza Vera', userName: 'afmendoza' },
  { name: 'Thalía Estefanía Vera Giler', userName: 'tevera' },
  { name: 'Cristhopher García Ponce', userName: 'cgarcia' },
  { name: 'Emily Brigitte Muñoz Menéndez', userName: 'ebmunoz' },
  { name: 'Daniel Esteban Cedeño Párraga', userName: 'decedenyo' },
  { name: 'Keily Mishell Alava Mora', userName: 'kmalava' },
  { name: 'Joshua David Zambrano Macías', userName: 'jdzambrano' },
  { name: 'Brenda Nathaly Macías Saltos', userName: 'bnmacias' },
  { name: 'Luis Ángel Vera Mendoza', userName: 'lavera' },
  { name: 'Samantha Gissel Choez Montesdeoca', userName: 'sgchoez' },
  { name: 'Josué Moisés Loor Vera', userName: 'jmloor' },
  { name: 'Daiana Carolina Pinto Cevallos', userName: 'dcpinto' },
  { name: 'Elián Matheo Reyes Mendoza', userName: 'emreyes' },
  { name: 'Alyson Gissela Franco Lucas', userName: 'agfranco' },
  { name: 'Jostin Alexander Baque Cedeño', userName: 'jabaque' },
  { name: 'Montserrat Alejandra Torres Vera', userName: 'matorres' },
  { name: 'Joel Stiven Mero Quiñonez', userName: 'jsmero' },
  { name: 'Domenica Valentina Saltos Mera', userName: 'dvsaltos' },
  { name: 'Kevin Alexis Vera Gómez', userName: 'kavera' },
  { name: 'Genesis Alelí Macías Mora', userName: 'gamacias' },
  { name: 'Santiago José Cevallos Vera', userName: 'sjcevallos' },
  { name: 'Anngelly Mishell Zambrano Saltos', userName: 'amzambrano' },
  { name: 'Diego Fernando Quiñonez Mendoza', userName: 'dfquinonez' },
  { name: 'Stefany Cristina Loor Mora', userName: 'scloor' },
  { name: 'Jeison Paolo Mendoza Ponce', userName: 'jpmendoza' },
  { name: 'Lisbeth Mishell Vera Cedeño', userName: 'lmvera' },
  { name: 'Bryan Josué Anchundia Torres', userName: 'bjanchundia' }
]

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('🌱 Iniciando seed...')

  const hashedPassword = await bcrypt.hash('123456', 10)

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
  await prisma.rolePermission.deleteMany({ where: { roleId: adminRole.id } })
  await prisma.rolePermission.createMany({
    data: permissionNames.map((name) => ({
      roleId: adminRole.id,
      permissionId: permissionIds.get(name)!
    }))
  })

  const teacherPerms = [
    ...CRUD_MODULES.map((m) => permName(m, 'read')),
    'lesson:create', 'lesson:update', 'lesson:delete',
    'task:create', 'task:update', 'task:delete',
    'grade:create', 'grade:update',
    'term-grade:create', 'term-grade:update',
    'enrollment:create',
    'academic:teacher-read'
  ]
  await prisma.rolePermission.deleteMany({ where: { roleId: teacherRole.id } })
  await prisma.rolePermission.createMany({
    data: teacherPerms.map((name) => ({
      roleId: teacherRole.id,
      permissionId: permissionIds.get(name)!
    }))
  })

  const studentPerms = ['academic:student-read', 'academic:submit-task']
  await prisma.rolePermission.deleteMany({ where: { roleId: studentRole.id } })
  await prisma.rolePermission.createMany({
    data: studentPerms.map((name) => ({
      roleId: studentRole.id,
      permissionId: permissionIds.get(name)!
    }))
  })
  console.log('✅ Permisos asignados a los 3 roles')

  // ---------- 4. ADMIN ----------
  await prisma.user.upsert({
    where: { userName: 'admin' },
    update: {},
    create: {
      name: 'Administrador del Sistema',
      userName: 'admin',
      password: hashedPassword,
      roleId: adminRole.id
    }
  })

  // ---------- 5. PROFESORES ----------
  const luis = await prisma.user.upsert({
    where: { userName: 'lmoreira' },
    update: {},
    create: {
      name: 'Luis Moreira Campuzano',
      userName: 'lmoreira',
      password: hashedPassword,
      roleId: teacherRole.id
    }
  })
  const jorge = await prisma.user.upsert({
    where: { userName: 'jmoreira' },
    update: {},
    create: {
      name: 'Jorge Moreira',
      userName: 'jmoreira',
      password: hashedPassword,
      roleId: teacherRole.id
    }
  })
  console.log(`✅ Profesores: Luis Moreira Campuzano (#${luis.id}), Jorge Moreira (#${jorge.id})`)

  // ---------- 6. ALUMNOS ----------
  const allAlumnos = [
    ...ALUMNOS_A.map((a) => ({ ...a, group: 'A' as const })),
    ...ALUMNOS_B.map((a) => ({ ...a, group: 'B' as const }))
  ]

  const alumnoUserIds: { A: number[]; B: number[] } = { A: [], B: [] }
  for (const a of allAlumnos) {
    const u = await prisma.user.upsert({
      where: { userName: a.userName },
      update: {},
      create: {
        name: a.name,
        userName: a.userName,
        password: hashedPassword,
        roleId: studentRole.id
      }
    })
    alumnoUserIds[a.group].push(u.id)
  }
  console.log(`✅ ${ALUMNOS_A.length} alumnos en 8vo A, ${ALUMNOS_B.length} alumnos en 8vo B (total: ${allAlumnos.length})`)

  // ---------- 7. INSTITUCIÓN + NIVEL + MATERIAS + PARALELOS ----------
  const institution = await prisma.institution.upsert({
    where: { name: 'Unidad Educativa República del Ecuador' },
    update: {},
    create: {
      name: 'Unidad Educativa República del Ecuador',
      description: 'Institución educativa pública de educación general básica'
    }
  })

  const level = await prisma.level.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Octavo', order: 8, institutionId: institution.id }
  })

  const matematicas = await prisma.subject.upsert({
    where: { name: 'Matemáticas' },
    update: {},
    create: { name: 'Matemáticas', institutionId: institution.id }
  })
  const lenguaje = await prisma.subject.upsert({
    where: { name: 'Lenguaje y Comunicación' },
    update: {},
    create: { name: 'Lenguaje y Comunicación', institutionId: institution.id }
  })

  const classA = await prisma.classGroup.upsert({
    where: { levelId_parallel: { levelId: level.id, parallel: 'A' } },
    update: {},
    create: { parallel: 'A', levelId: level.id, institutionId: institution.id }
  })
  const classB = await prisma.classGroup.upsert({
    where: { levelId_parallel: { levelId: level.id, parallel: 'B' } },
    update: {},
    create: { parallel: 'B', levelId: level.id, institutionId: institution.id }
  })
  console.log(`✅ Institución: Unidad Educativa República del Ecuador`)

  // ---------- 8. MATRÍCULAS ----------
  for (const sid of alumnoUserIds.A) {
    await prisma.enrollment.upsert({
      where: { classGroupId_studentId: { classGroupId: classA.id, studentId: sid } },
      update: {},
      create: { classGroupId: classA.id, studentId: sid }
    })
  }
  for (const sid of alumnoUserIds.B) {
    await prisma.enrollment.upsert({
      where: { classGroupId_studentId: { classGroupId: classB.id, studentId: sid } },
      update: {},
      create: { classGroupId: classB.id, studentId: sid }
    })
  }
  console.log(`✅ Matrículas: ${alumnoUserIds.A.length} en 8vo A, ${alumnoUserIds.B.length} en 8vo B`)

  // ---------- 9. ASIGNACIONES ----------
  const taLuis = await prisma.teachingAssignment.upsert({
    where: { subjectId_classGroupId: { subjectId: matematicas.id, classGroupId: classA.id } },
    update: {},
    create: { subjectId: matematicas.id, classGroupId: classA.id, teacherId: luis.id }
  })
  const taJorge = await prisma.teachingAssignment.upsert({
    where: { subjectId_classGroupId: { subjectId: lenguaje.id, classGroupId: classB.id } },
    update: {},
    create: { subjectId: lenguaje.id, classGroupId: classB.id, teacherId: jorge.id }
  })

  // ---------- 10. HORARIOS ----------
  const horarios = [
    { ta: taLuis.id, day: 'lunes' as const, start: '07:00', end: '08:30' },
    { ta: taLuis.id, day: 'miercoles' as const, start: '07:00', end: '08:30' },
    { ta: taLuis.id, day: 'viernes' as const, start: '09:00', end: '10:30' },
    { ta: taJorge.id, day: 'martes' as const, start: '07:00', end: '08:30' },
    { ta: taJorge.id, day: 'jueves' as const, start: '07:00', end: '08:30' },
    { ta: taJorge.id, day: 'viernes' as const, start: '11:00', end: '12:30' }
  ]
  for (const h of horarios) {
    const exists = await prisma.schedule.findFirst({
      where: { teachingAssignmentId: h.ta, dayOfWeek: h.day }
    })
    if (!exists) {
      await prisma.schedule.create({
        data: {
          teachingAssignmentId: h.ta,
          dayOfWeek: h.day,
          startTime: new Date(`1970-01-01T${h.start}:00Z`),
          endTime: new Date(`1970-01-01T${h.end}:00Z`)
        }
      })
    }
  }
  console.log(`✅ Horarios creados (6 bloques)`)

  // ---------- 11. LECCIONES Y TAREAS ----------
  // Matemáticas (Luis)
  await createLessonsAndTasks(
    taLuis.id, luis.id, matematicas.name,
    [
      { title: 'Unidad 1: Números enteros y operaciones', content: 'Definición de números enteros positivos y negativos. Operaciones básicas: suma, resta, multiplicación y división. Propiedades y ejercicios resueltos.' },
      { title: 'Unidad 2: Fracciones', content: 'Concepto de fracción. Fracciones equivalentes. Operaciones con fracciones heterogéneas: suma, resta, multiplicación y división.' },
      { title: 'Unidad 3: Álgebra básica', content: 'Introducción a las variables. Ecuaciones de primer grado con una incógnita. Resolución de problemas cotidianos.' }
    ],
    [
      {
        title: 'Tarea 1: Operaciones con números enteros',
        description: 'Resolver los ejercicios 1 al 15 de la guía didáctica. Mostrar el procedimiento completo.',
        type: 'documento' as const,
        maxScore: 10,
        dueDate: '2026-06-30',
        questions: undefined
      },
      {
        title: 'Examen: Números enteros',
        description: 'Cuestionario auto-calificable sobre operaciones con enteros.',
        type: 'examen' as const,
        maxScore: 10,
        dueDate: '2026-07-02',
        questions: [
          {
            text: '¿Cuánto es (-8) + (+5)?',
            options: [
              { text: '-3', isCorrect: true },
              { text: '3', isCorrect: false },
              { text: '-13', isCorrect: false }
            ]
          },
          {
            text: '¿Cuánto es (-6) × (-4)?',
            options: [
              { text: '-24', isCorrect: false },
              { text: '24', isCorrect: true },
              { text: '10', isCorrect: false }
            ]
          },
          {
            text: '¿Cuánto es 24 ÷ (-6)?',
            options: [
              { text: '4', isCorrect: false },
              { text: '-4', isCorrect: true },
              { text: '-18', isCorrect: false }
            ]
          },
          {
            text: '¿Cuál es el opuesto aditivo de -9?',
            options: [
              { text: '-9', isCorrect: false },
              { text: '0', isCorrect: false },
              { text: '9', isCorrect: true }
            ]
          },
          {
            text: '¿Cuánto es (-3)²?',
            options: [
              { text: '-6', isCorrect: false },
              { text: '6', isCorrect: false },
              { text: '9', isCorrect: true }
            ]
          }
        ]
      },
      {
        title: 'Tarea 2: Suma y resta de fracciones',
        description: 'Resolver los ejercicios propuestos del libro de texto página 45. Mínimo 10 ejercicios.',
        type: 'documento' as const,
        maxScore: 10,
        dueDate: '2026-07-03',
        questions: undefined
      }
    ]
  )

  // Lenguaje (Jorge)
  await createLessonsAndTasks(
    taJorge.id, jorge.id, lenguaje.name,
    [
      { title: 'El texto narrativo', content: 'Características del texto narrativo: narrador, personajes, espacio, tiempo y acción. Tipos de narrador (primera, segunda y tercera persona).' },
      { title: 'El ensayo argumentativo', content: 'Estructura del ensayo: introducción, desarrollo y conclusión. Tipos de argumentos: lógico, de autoridad, emocional. Cómo citar fuentes.' },
      { title: 'Reglas ortográficas generales', content: 'Uso de la b, v, c, s, z. Reglas de acentuación: agudas, graves, esdrújulas. Casos especiales de tilde diacrítica.' }
    ],
    [
      {
        title: 'Ensayo: Mi experiencia escolar',
        description: 'Escribir un ensayo argumentativo de 400 palabras sobre tu experiencia en la escuela. Mínimo 3 argumentos con ejemplos.',
        type: 'documento' as const,
        maxScore: 15,
        dueDate: '2026-07-01',
        questions: undefined
      },
      {
        title: 'Examen: Reglas ortográficas',
        description: 'Cuestionario auto-calificable sobre ortografía y acentuación.',
        type: 'examen' as const,
        maxScore: 10,
        dueDate: '2026-07-03',
        questions: [
          {
            text: '¿Cuál es la palabra correctamente escrita?',
            options: [
              { text: 'Avocadro', isCorrect: false },
              { text: 'Aguacate', isCorrect: true },
              { text: 'Aguacatre', isCorrect: false }
            ]
          },
          {
            text: '¿Qué palabra lleva tilde?',
            options: [
              { text: 'Camino', isCorrect: false },
              { text: 'Árbol', isCorrect: true },
              { text: 'Mesa', isCorrect: false }
            ]
          },
          {
            text: '¿Cuándo se usa "v" en lugar de "b"?',
            options: [
              { text: 'Después de "m"', isCorrect: false },
              { text: 'Después de "n"', isCorrect: true },
              { text: 'Al inicio de palabras', isCorrect: false }
            ]
          },
          {
            text: '¿Qué palabra es esdrújula?',
            options: [
              { text: 'Canción', isCorrect: false },
              { text: 'Música', isCorrect: true },
              { text: 'Camino', isCorrect: false }
            ]
          }
        ]
      },
      {
        title: 'Análisis de cuento: El vejete de la montaña',
        description: 'Leer el cuento adjunto y responder las 5 preguntas de análisis literario (personajes, ambiente, conflicto, tema y narrador).',
        type: 'documento' as const,
        maxScore: 10,
        dueDate: '2026-07-03',
        questions: undefined
      }
    ]
  )

  // ---------- 12. ENTREGAS Y CALIFICACIONES DE LA SEMANA ----------
  // Fechas de referencia: Lun 29/Jun al Vie 3/Jul 2026
  const weekDates = ['2026-06-29', '2026-06-30', '2026-07-01', '2026-07-02', '2026-07-03']

  // Tarea 1 de Matemáticas (documento, vence 30/Jun)
  // ~15 alumnos la entregaron, ~10 calificadas, ~5 pendientes
  const matTask1 = await prisma.task.findFirst({
    where: { teachingAssignmentId: taLuis.id, title: 'Tarea 1: Operaciones con números enteros' }
  })
  if (matTask1) {
    await createSubmissionsForTask(
      matTask1.id, luis.id, alumnoUserIds.A, 15, '2026-06-29', '2026-06-30', 10, 8
    )
  }

  // Examen de Matemáticas (cuestionario, vence 02/Jul)
  const matExam = await prisma.task.findFirst({
    where: { teachingAssignmentId: taLuis.id, title: 'Examen: Números enteros' }
  })
  if (matExam) {
    await createQuizSubmissions(matExam.id, alumnoUserIds.A, 18, '2026-07-01', '2026-07-02')
  }

  // Tarea 2 de Matemáticas (documento, vence 03/Jul)
  const matTask2 = await prisma.task.findFirst({
    where: { teachingAssignmentId: taLuis.id, title: 'Tarea 2: Suma y resta de fracciones' }
  })
  if (matTask2) {
    await createSubmissionsForTask(
      matTask2.id, luis.id, alumnoUserIds.A, 8, '2026-07-02', '2026-07-03', 10, 3
    )
  }

  // Ensayo de Lenguaje (documento, vence 01/Jul)
  const lengTask1 = await prisma.task.findFirst({
    where: { teachingAssignmentId: taJorge.id, title: 'Ensayo: Mi experiencia escolar' }
  })
  if (lengTask1) {
    await createSubmissionsForTask(
      lengTask1.id, jorge.id, alumnoUserIds.B, 18, '2026-06-29', '2026-07-01', 15, 12
    )
  }

  // Examen de Lenguaje (cuestionario, vence 03/Jul)
  const lengExam = await prisma.task.findFirst({
    where: { teachingAssignmentId: taJorge.id, title: 'Examen: Reglas ortográficas' }
  })
  if (lengExam) {
    await createQuizSubmissions(lengExam.id, alumnoUserIds.B, 22, '2026-07-02', '2026-07-03')
  }

  // Análisis de cuento (documento, vence 03/Jul)
  const lengTask2 = await prisma.task.findFirst({
    where: { teachingAssignmentId: taJorge.id, title: 'Análisis de cuento: El vejete de la montaña' }
  })
  if (lengTask2) {
    await createSubmissionsForTask(
      lengTask2.id, jorge.id, alumnoUserIds.B, 10, '2026-07-02', '2026-07-03', 10, 4
    )
  }

  // ---------- 13. NOTAS DE PARCIAL ----------
  // Luis califica el primer parcial a sus 23 alumnos (los que tienen entregas)
  for (const sid of alumnoUserIds.A) {
    const score = (Math.random() * 3 + 7).toFixed(1) // 7.0 - 10.0
    await prisma.termGrade.upsert({
      where: {
        teachingAssignmentId_studentId_term: {
          teachingAssignmentId: taLuis.id,
          studentId: sid,
          term: 'primerParcial'
        }
      },
      update: {},
      create: {
        teachingAssignmentId: taLuis.id,
        studentId: sid,
        term: 'primerParcial',
        score: Number(score),
        observations: Math.random() > 0.6 ? 'Buen desempeño, seguir así.' : undefined
      }
    })
  }
  // Jorge califica a sus 27 alumnos
  for (const sid of alumnoUserIds.B) {
    const score = (Math.random() * 3 + 7).toFixed(1)
    await prisma.termGrade.upsert({
      where: {
        teachingAssignmentId_studentId_term: {
          teachingAssignmentId: taJorge.id,
          studentId: sid,
          term: 'primerParcial'
        }
      },
      update: {},
      create: {
        teachingAssignmentId: taJorge.id,
        studentId: sid,
        term: 'primerParcial',
        score: Number(score),
        observations: Math.random() > 0.6 ? 'Buen trabajo en clase.' : undefined
      }
    })
  }
  console.log(`✅ Notas de parcial creadas para los 50 alumnos`)

  // ---------- 14. MENÚS LMS ----------
  const lmsMenus = [
    { key: 'lms-dashboard', label: 'Dashboard', href: '/lms', icon: 'LayoutDashboard', order: 1 },
    { key: 'lms-my-courses', label: 'Mis Cursos', href: '/lms/my-courses', icon: 'BookOpen', order: 2 },
    { key: 'lms-my-schedule', label: 'Mi Horario', href: '/lms/my-schedule', icon: 'CalendarDays', order: 3 },
    { key: 'lms-my-grades', label: 'Mis Notas', href: '/lms/my-grades', icon: 'GraduationCap', order: 4 },
    { key: 'lms-teacher-assignments', label: 'Mis Clases', href: '/lms/teacher/assignments', icon: 'ClipboardList', order: 5 },
    { key: 'lms-teacher-schedule', label: 'Mi Horario', href: '/lms/teacher/schedule', icon: 'CalendarDays', order: 6 },
    { key: 'lms-teacher-grading', label: 'Calificar', href: '/lms/teacher/grading', icon: 'ClipboardCheck', order: 7 },
    { key: 'lms-admin-institutions', label: 'Instituciones', href: '/lms/admin/institutions', icon: 'Building2', order: 8 },
    { key: 'lms-admin-levels', label: 'Niveles', href: '/lms/admin/levels', icon: 'Layers', order: 9 },
    { key: 'lms-admin-subjects', label: 'Materias', href: '/lms/admin/subjects', icon: 'BookOpen', order: 10 },
    { key: 'lms-admin-class-groups', label: 'Paralelos', href: '/lms/admin/class-groups', icon: 'Network', order: 11 },
    { key: 'lms-admin-students', label: 'Estudiantes', href: '/lms/admin/students', icon: 'UsersRound', order: 12 },
    { key: 'lms-admin-teachers', label: 'Profesores', href: '/lms/admin/teachers', icon: 'UserCog', order: 13 },
    { key: 'lms-admin-enrollments', label: 'Matrículas', href: '/lms/admin/enrollments', icon: 'GraduationCap', order: 14 },
    { key: 'lms-admin-teaching-assignments', label: 'Asignaciones', href: '/lms/admin/teaching-assignments', icon: 'ClipboardList', order: 15 },
    { key: 'lms-admin-schedule', label: 'Horarios', href: '/lms/admin/schedule', icon: 'CalendarDays', order: 16 },
    { key: 'lms-profile', label: 'Mi Perfil', href: '/lms/profile', icon: 'UserCog', order: 99 }
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

  const adminMenuKeys = [
    'lms-dashboard', 'lms-admin-institutions', 'lms-admin-levels', 'lms-admin-subjects',
    'lms-admin-class-groups', 'lms-admin-students', 'lms-admin-teachers',
    'lms-admin-enrollments', 'lms-admin-teaching-assignments', 'lms-admin-schedule', 'lms-profile'
  ]
  const teacherMenuKeys = [
    'lms-dashboard', 'lms-teacher-assignments', 'lms-teacher-schedule', 'lms-teacher-grading', 'lms-profile'
  ]
  const studentMenuKeys = [
    'lms-dashboard', 'lms-my-courses', 'lms-my-schedule', 'lms-my-grades', 'lms-profile'
  ]

  for (const [role, keys] of [
    [adminRole, adminMenuKeys],
    [teacherRole, teacherMenuKeys],
    [studentRole, studentMenuKeys]
  ] as const) {
    await prisma.menuSectionPermission.deleteMany({ where: { roleId: role.id } })
    await prisma.menuSectionPermission.createMany({
      data: keys.map((k) => ({
        roleId: role.id,
        menuSectionId: menuIds.get(k)!
      }))
    })
  }
  console.log(`✅ ${lmsMenus.length} menús LMS creados y asignados`)

  console.log('\n🎉 Seed completado.')
  console.log('   ─────────────────────────────────')
  console.log('   👤 admin / 123456 — Administrador')
  console.log('   👨‍🏫 lmoreira / 123456 — Luis Moreira (Matemáticas, 8vo A)')
  console.log('   👨‍🏫 jmoreira / 123456 — Jorge Moreira (Lenguaje, 8vo B)')
  console.log('   👥 50 alumnos / 123456')
  console.log('   ─────────────────────────────────')
}

// ============================================================
// HELPERS
// ============================================================

async function createLessonsAndTasks(
  taId: number,
  teacherId: number,
  subjectName: string,
  lessons: { title: string; content?: string }[],
  tasks: {
    title: string
    description: string
    type: 'documento' | 'examen'
    maxScore: number
    dueDate: string
    questions?: { text: string; options: { text: string; isCorrect: boolean }[] }[]
  }[]
) {
  // Lecciones
  for (let i = 0; i < lessons.length; i++) {
    const existing = await prisma.lesson.findFirst({
      where: { teachingAssignmentId: taId, title: lessons[i].title }
    })
    if (!existing) {
      await prisma.lesson.create({
        data: {
          teachingAssignmentId: taId,
          title: lessons[i].title,
          content: lessons[i].content,
          order: i + 1
        }
      })
    }
  }

  // Tareas
  for (const t of tasks) {
    const existing = await prisma.task.findFirst({
      where: { teachingAssignmentId: taId, title: t.title }
    })
    if (existing) continue

    await prisma.task.create({
      data: {
        teachingAssignmentId: taId,
        title: t.title,
        description: t.description,
        type: t.type,
        maxScore: t.maxScore,
        dueDate: new Date(t.dueDate + 'T23:59:59Z'),
        ...(t.type === 'examen' && t.questions
          ? {
              questions: {
                create: t.questions.map((q, qi) => ({
                  text: q.text,
                  order: qi,
                  options: {
                    create: q.options.map((o, oi) => ({
                      text: o.text,
                      isCorrect: o.isCorrect,
                      order: oi
                    }))
                  }
                }))
              }
            }
          : {})
      }
    })
  }
  console.log(`✅ Lecciones y tareas creadas para ${subjectName}`)
}

async function createSubmissionsForTask(
  taskId: number,
  teacherId: number,
  studentIds: number[],
  count: number,
  startDate: string,
  endDate: string,
  maxScore: number,
  gradedCount: number
) {
  // Tomar los primeros `count` alumnos
  const selected = studentIds.slice(0, count)
  const start = new Date(startDate + 'T08:00:00Z').getTime()
  const end = new Date(endDate + 'T17:00:00Z').getTime()

  for (let i = 0; i < selected.length; i++) {
    const sid = selected[i]
    // Fecha aleatoria entre startDate y endDate
    const submittedAt = new Date(start + Math.random() * (end - start))
    const isGraded = i < gradedCount
    const score = isGraded ? Math.round((Math.random() * 3 + 7) * 10) / 10 : 0 // 7.0 - 10.0

    const sub = await prisma.submission.upsert({
      where: { taskId_studentId: { taskId, studentId: sid } },
      update: {},
      create: {
        taskId,
        studentId: sid,
        fileUrl: `/uploads/tarea-${taskId}-${sid}.pdf`,
        comment: Math.random() > 0.7 ? 'Aquí está mi trabajo profesor.' : undefined,
        status: isGraded ? 'calificada' : 'entregada',
        submittedAt
      }
    })

    if (isGraded) {
      await prisma.grade.upsert({
        where: { submissionId: sub.id },
        update: {},
        create: {
          submissionId: sub.id,
          score,
          feedback: Math.random() > 0.5
            ? 'Buen trabajo. Revisar el ejercicio 3.'
            : 'Excelente presentación, seguir así.',
          gradedById: teacherId,
          gradedAt: new Date(submittedAt.getTime() + 3600000) // 1h después
        }
      })
    }
  }
}

async function createQuizSubmissions(
  taskId: number,
  studentIds: number[],
  count: number,
  startDate: string,
  endDate: string
) {
  // Cargar las preguntas del examen
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { questions: { include: { options: true } } }
  })
  if (!task || !task.questions?.length) return

  const selected = studentIds.slice(0, count)
  const start = new Date(startDate + 'T08:00:00Z').getTime()
  const end = new Date(endDate + 'T17:00:00Z').getTime()

  for (const sid of selected) {
    const submittedAt = new Date(start + Math.random() * (end - start))
    const answers: Record<number, number> = {}

    // Simular respuestas: ~70% correctas
    let correctCount = 0
    for (const q of task.questions) {
      const correctOption = q.options.find((o) => o.isCorrect)
      const isCorrectAnswer = Math.random() < 0.7 // 70% de probabilidad de responder bien
      if (isCorrectAnswer && correctOption) {
        answers[q.id] = correctOption.id
        correctCount++
      } else {
        // Responder mal (cualquier opción incorrecta)
        const wrongOptions = q.options.filter((o) => !o.isCorrect)
        const wrong = wrongOptions[Math.floor(Math.random() * wrongOptions.length)]
        if (wrong) answers[q.id] = wrong.id
      }
    }

    const score = Math.round((correctCount / task.questions.length) * Number(task.maxScore) * 100) / 100

    const sub = await prisma.submission.upsert({
      where: { taskId_studentId: { taskId, studentId: sid } },
      update: {},
      create: {
        taskId,
        studentId: sid,
        answers: answers,
        status: 'calificada',
        submittedAt
      }
    })

    await prisma.grade.upsert({
      where: { submissionId: sub.id },
      update: {},
      create: {
        submissionId: sub.id,
        score,
        feedback: `Auto-calificado: ${correctCount} de ${task.questions.length} respuestas correctas.`,
        gradedById: sid, // auto-calificación
        gradedAt: new Date(submittedAt.getTime() + 5000) // instantáneo
      }
    })
  }
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
