-- ============================================================
-- DDL COMPLETO - Sistema LMS ULEAM
-- Motor: PostgreSQL
-- Database: systemLMS | Schema: prod
-- 20 tablas + 4 enums (sin _prisma_migrations)
-- ============================================================

-- ============================================================
-- ENUMS (tipos personalizados)
-- ============================================================

-- Tipo de tarea: subir documento o cuestionario auto-calificable
CREATE TYPE "taskType" AS ENUM ('documento', 'examen');

-- Estado de una entrega
CREATE TYPE "submissionStatus" AS ENUM ('pendiente', 'entregada', 'calificada');

-- Parciales/trimestre
CREATE TYPE "term" AS ENUM ('primerParcial', 'segundoParcial', 'tercerParcial', 'final');

-- Días de la semana (sin tildes por requisito de Prisma)
CREATE TYPE "weekDay" AS ENUM ('domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado');

-- ============================================================
-- SECUENCIAS (auto-increment)
-- ============================================================
CREATE SEQUENCE classGroup_id_seq;
CREATE SEQUENCE enrollment_id_seq;
CREATE SEQUENCE grade_id_seq;
CREATE SEQUENCE institution_id_seq;
CREATE SEQUENCE lesson_id_seq;
CREATE SEQUENCE level_id_seq;
CREATE SEQUENCE menuSection_id_seq;
CREATE SEQUENCE menuSectionPermission_id_seq;
CREATE SEQUENCE option_id_seq;
CREATE SEQUENCE permission_id_seq;
CREATE SEQUENCE question_id_seq;
CREATE SEQUENCE role_id_seq;
CREATE SEQUENCE rolePermission_id_seq;
CREATE SEQUENCE schedule_id_seq;
CREATE SEQUENCE subject_id_seq;
CREATE SEQUENCE submission_id_seq;
CREATE SEQUENCE task_id_seq;
CREATE SEQUENCE teachingAssignment_id_seq;
CREATE SEQUENCE termGrade_id_seq;
CREATE SEQUENCE user_id_seq;

-- ============================================================
-- TABLAS DEL SISTEMA (RBAC - Roles, Permisos, Usuarios)
-- ============================================================

-- 1. USUARIO (admin, profesores y alumnos son el mismo modelo)
CREATE TABLE "user" (
    "id" integer DEFAULT nextval('user_id_seq'::regclass) NOT NULL,
    "name" varchar(100) NOT NULL,
    "userName" varchar(100) NOT NULL,
    "password" varchar(255) NOT NULL,
    "roleId" integer NOT NULL,
    "state" boolean DEFAULT true NOT NULL,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "user" ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");
ALTER TABLE "user" ADD CONSTRAINT "user_userName_key" UNIQUE ("userName");

-- 2. ROL
CREATE TABLE "role" (
    "id" integer DEFAULT nextval('role_id_seq'::regclass) NOT NULL,
    "name" varchar(50) NOT NULL,
    "state" boolean DEFAULT true NOT NULL,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "role" ADD CONSTRAINT "role_pkey" PRIMARY KEY ("id");
ALTER TABLE "role" ADD CONSTRAINT "role_name_key" UNIQUE ("name");

-- 3. PERMISO (formato: modulo:accion, ej: 'institution:create')
CREATE TABLE "permission" (
    "id" integer DEFAULT nextval('permission_id_seq'::regclass) NOT NULL,
    "name" varchar(100) NOT NULL,
    "state" boolean DEFAULT true NOT NULL,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "permission" ADD CONSTRAINT "permission_pkey" PRIMARY KEY ("id");
ALTER TABLE "permission" ADD CONSTRAINT "permission_name_key" UNIQUE ("name");

-- 4. ROL-PERMISO (tabla intermedia N:M)
CREATE TABLE "rolePermission" (
    "id" integer DEFAULT nextval('rolePermission_id_seq'::regclass) NOT NULL,
    "roleId" integer NOT NULL,
    "permissionId" integer NOT NULL,
    "state" boolean DEFAULT true NOT NULL,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "rolePermission" ADD CONSTRAINT "rolePermission_pkey" PRIMARY KEY ("id");
ALTER TABLE "rolePermission" ADD CONSTRAINT "rolePermission_roleId_fkey"
    FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "rolePermission" ADD CONSTRAINT "rolePermission_permissionId_fkey"
    FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 5. SECCIÓN DE MENÚ (items del sidebar, dinámicos por rol)
CREATE TABLE "menuSection" (
    "id" integer DEFAULT nextval('menuSection_id_seq'::regclass) NOT NULL,
    "key" varchar(100) NOT NULL,
    "label" varchar(100) NOT NULL,
    "href" varchar(255) NOT NULL,
    "icon" varchar(50) NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "parentId" integer,
    "state" boolean DEFAULT true NOT NULL,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "menuSection" ADD CONSTRAINT "menuSection_pkey" PRIMARY KEY ("id");
ALTER TABLE "menuSection" ADD CONSTRAINT "menuSection_key_key" UNIQUE ("key");
ALTER TABLE "menuSection" ADD CONSTRAINT "menuSection_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "menuSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 6. PERMISO DE MENÚ (asignación de menú → rol)
CREATE TABLE "menuSectionPermission" (
    "id" integer DEFAULT nextval('menuSectionPermission_id_seq'::regclass) NOT NULL,
    "menuSectionId" integer NOT NULL,
    "roleId" integer,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "menuSectionPermission" ADD CONSTRAINT "menuSectionPermission_pkey" PRIMARY KEY ("id");
ALTER TABLE "menuSectionPermission" ADD CONSTRAINT "menuSectionPermission_menuSectionId_fkey"
    FOREIGN KEY ("menuSectionId") REFERENCES "menuSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "menuSectionPermission" ADD CONSTRAINT "menuSectionPermission_roleId_fkey"
    FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- TABLAS ACADÉMICAS (LMS)
-- ============================================================

-- 7. INSTITUCIÓN
CREATE TABLE "institution" (
    "id" integer DEFAULT nextval('institution_id_seq'::regclass) NOT NULL,
    "name" varchar(150) NOT NULL,
    "description" text,
    "state" boolean DEFAULT true NOT NULL,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "institution" ADD CONSTRAINT "institution_pkey" PRIMARY KEY ("id");
ALTER TABLE "institution" ADD CONSTRAINT "institution_name_key" UNIQUE ("name");

-- 8. NIVEL (7mo, 8vo, 9no)
CREATE TABLE "level" (
    "id" integer DEFAULT nextval('level_id_seq'::regclass) NOT NULL,
    "name" varchar(50) NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "institutionId" integer NOT NULL,
    "state" boolean DEFAULT true NOT NULL,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "level" ADD CONSTRAINT "level_pkey" PRIMARY KEY ("id");
ALTER TABLE "level" ADD CONSTRAINT "level_institutionId_fkey"
    FOREIGN KEY ("institutionId") REFERENCES "institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 9. MATERIA
CREATE TABLE "subject" (
    "id" integer DEFAULT nextval('subject_id_seq'::regclass) NOT NULL,
    "name" varchar(100) NOT NULL,
    "institutionId" integer NOT NULL,
    "state" boolean DEFAULT true NOT NULL,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "subject" ADD CONSTRAINT "subject_pkey" PRIMARY KEY ("id");
ALTER TABLE "subject" ADD CONSTRAINT "subject_name_key" UNIQUE ("name");
ALTER TABLE "subject" ADD CONSTRAINT "subject_institutionId_fkey"
    FOREIGN KEY ("institutionId") REFERENCES "institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 10. PARALELO (8vo A, 8vo B)
CREATE TABLE "classGroup" (
    "id" integer DEFAULT nextval('classGroup_id_seq'::regclass) NOT NULL,
    "parallel" varchar(10) NOT NULL,
    "levelId" integer NOT NULL,
    "institutionId" integer NOT NULL,
    "state" boolean DEFAULT true NOT NULL,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "classGroup" ADD CONSTRAINT "classGroup_pkey" PRIMARY KEY ("id");
ALTER TABLE "classGroup" ADD CONSTRAINT "classGroup_levelId_parallel_key" UNIQUE ("levelId", "parallel");
ALTER TABLE "classGroup" ADD CONSTRAINT "classGroup_levelId_fkey"
    FOREIGN KEY ("levelId") REFERENCES "level"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "classGroup" ADD CONSTRAINT "classGroup_institutionId_fkey"
    FOREIGN KEY ("institutionId") REFERENCES "institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 11. MATRÍCULA (alumno ↔ paralelo, tabla intermedia N:M)
CREATE TABLE "enrollment" (
    "id" integer DEFAULT nextval('enrollment_id_seq'::regclass) NOT NULL,
    "classGroupId" integer NOT NULL,
    "studentId" integer NOT NULL,
    "state" boolean DEFAULT true NOT NULL,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_pkey" PRIMARY KEY ("id");
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_classGroupId_studentId_key" UNIQUE ("classGroupId", "studentId");
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_classGroupId_fkey"
    FOREIGN KEY ("classGroupId") REFERENCES "classGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 12. ASIGNACIÓN ACADÉMICA (materia + paralelo + profesor = "la clase")
CREATE TABLE "teachingAssignment" (
    "id" integer DEFAULT nextval('teachingAssignment_id_seq'::regclass) NOT NULL,
    "subjectId" integer NOT NULL,
    "classGroupId" integer NOT NULL,
    "teacherId" integer NOT NULL,
    "state" boolean DEFAULT true NOT NULL,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "teachingAssignment" ADD CONSTRAINT "teachingAssignment_pkey" PRIMARY KEY ("id");
ALTER TABLE "teachingAssignment" ADD CONSTRAINT "teachingAssignment_subjectId_classGroupId_key"
    UNIQUE ("subjectId", "classGroupId");
ALTER TABLE "teachingAssignment" ADD CONSTRAINT "teachingAssignment_subjectId_fkey"
    FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teachingAssignment" ADD CONSTRAINT "teachingAssignment_classGroupId_fkey"
    FOREIGN KEY ("classGroupId") REFERENCES "classGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teachingAssignment" ADD CONSTRAINT "teachingAssignment_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 13. LECCIÓN (material de estudio dentro de una asignación)
CREATE TABLE "lesson" (
    "id" integer DEFAULT nextval('lesson_id_seq'::regclass) NOT NULL,
    "teachingAssignmentId" integer NOT NULL,
    "title" varchar(150) NOT NULL,
    "content" text,
    "order" integer DEFAULT 0 NOT NULL,
    "state" boolean DEFAULT true NOT NULL,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_pkey" PRIMARY KEY ("id");
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_teachingAssignmentId_fkey"
    FOREIGN KEY ("teachingAssignmentId") REFERENCES "teachingAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 14. TAREA (puede ser tipo 'documento' o tipo 'examen' / cuestionario)
CREATE TABLE "task" (
    "id" integer DEFAULT nextval('task_id_seq'::regclass) NOT NULL,
    "teachingAssignmentId" integer NOT NULL,
    "lessonId" integer,
    "title" varchar(150) NOT NULL,
    "description" text,
    "type" "taskType" DEFAULT 'documento' NOT NULL,
    "dueDate" timestamptz,
    "maxScore" numeric(5,2) DEFAULT 10 NOT NULL,
    "state" boolean DEFAULT true NOT NULL,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "task" ADD CONSTRAINT "task_pkey" PRIMARY KEY ("id");
ALTER TABLE "task" ADD CONSTRAINT "task_teachingAssignmentId_fkey"
    FOREIGN KEY ("teachingAssignmentId") REFERENCES "teachingAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task" ADD CONSTRAINT "task_lessonId_fkey"
    FOREIGN KEY ("lessonId") REFERENCES "lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 15. PREGUNTA (de un cuestionario, task tipo 'examen')
CREATE TABLE "question" (
    "id" integer DEFAULT nextval('question_id_seq'::regclass) NOT NULL,
    "taskId" integer NOT NULL,
    "text" text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "state" boolean DEFAULT true NOT NULL,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "question" ADD CONSTRAINT "question_pkey" PRIMARY KEY ("id");
ALTER TABLE "question" ADD CONSTRAINT "question_taskId_fkey"
    FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 16. OPCIÓN (respuesta de una pregunta, una es correcta)
CREATE TABLE "option" (
    "id" integer DEFAULT nextval('option_id_seq'::regclass) NOT NULL,
    "questionId" integer NOT NULL,
    "text" varchar(300) NOT NULL,
    "isCorrect" boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "state" boolean DEFAULT true NOT NULL,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "option" ADD CONSTRAINT "option_pkey" PRIMARY KEY ("id");
ALTER TABLE "option" ADD CONSTRAINT "option_questionId_fkey"
    FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 17. HORARIO (bloque de clase: día + horas)
CREATE TABLE "schedule" (
    "id" integer DEFAULT nextval('schedule_id_seq'::regclass) NOT NULL,
    "teachingAssignmentId" integer NOT NULL,
    "dayOfWeek" "weekDay" NOT NULL,
    "startTime" time(3) without time zone NOT NULL,
    "endTime" time(3) without time zone NOT NULL,
    "state" boolean DEFAULT true NOT NULL,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_pkey" PRIMARY KEY ("id");
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_teachingAssignmentId_fkey"
    FOREIGN KEY ("teachingAssignmentId") REFERENCES "teachingAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 18. ENTREGA (lo que el alumno sube/responde para una tarea)
CREATE TABLE "submission" (
    "id" integer DEFAULT nextval('submission_id_seq'::regclass) NOT NULL,
    "taskId" integer NOT NULL,
    "studentId" integer NOT NULL,
    "fileUrl" varchar(255),
    "comment" text,
    "answers" jsonb,
    "submittedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "status" "submissionStatus" DEFAULT 'pendiente' NOT NULL,
    "state" boolean DEFAULT true NOT NULL,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "submission" ADD CONSTRAINT "submission_pkey" PRIMARY KEY ("id");
ALTER TABLE "submission" ADD CONSTRAINT "submission_taskId_studentId_key" UNIQUE ("taskId", "studentId");
ALTER TABLE "submission" ADD CONSTRAINT "submission_taskId_fkey"
    FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "submission" ADD CONSTRAINT "submission_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 19. CALIFICACIÓN (nota de una entrega, relación 1:1)
CREATE TABLE "grade" (
    "id" integer DEFAULT nextval('grade_id_seq'::regclass) NOT NULL,
    "submissionId" integer NOT NULL,
    "score" numeric(5,2) NOT NULL,
    "feedback" text,
    "gradedById" integer NOT NULL,
    "gradedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "state" boolean DEFAULT true NOT NULL,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "grade" ADD CONSTRAINT "grade_pkey" PRIMARY KEY ("id");
ALTER TABLE "grade" ADD CONSTRAINT "grade_submissionId_key" UNIQUE ("submissionId");
ALTER TABLE "grade" ADD CONSTRAINT "grade_submissionId_fkey"
    FOREIGN KEY ("submissionId") REFERENCES "submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "grade" ADD CONSTRAINT "grade_gradedById_fkey"
    FOREIGN KEY ("gradedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 20. NOTA DE PARCIAL (calificación por parcial/trimestre)
CREATE TABLE "termGrade" (
    "id" integer DEFAULT nextval('termGrade_id_seq'::regclass) NOT NULL,
    "teachingAssignmentId" integer NOT NULL,
    "studentId" integer NOT NULL,
    "term" "term" NOT NULL,
    "score" numeric(5,2) NOT NULL,
    "observations" text,
    "state" boolean DEFAULT true NOT NULL,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE "termGrade" ADD CONSTRAINT "termGrade_pkey" PRIMARY KEY ("id");
ALTER TABLE "termGrade" ADD CONSTRAINT "termGrade_teachingAssignmentId_studentId_term_key"
    UNIQUE ("teachingAssignmentId", "studentId", "term");
ALTER TABLE "termGrade" ADD CONSTRAINT "termGrade_teachingAssignmentId_fkey"
    FOREIGN KEY ("teachingAssignmentId") REFERENCES "teachingAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "termGrade" ADD CONSTRAINT "termGrade_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
