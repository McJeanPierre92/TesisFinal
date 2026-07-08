/**
 * Google Apps Script para crear automáticamente las dos encuestas de la tesis en Google Forms.
 * 
 * INSTRUCCIONES:
 * 1. Ve a https://script.google.com/
 * 2. Haz clic en "Nuevo proyecto" (New Project).
 * 3. Borra el código existente y pega este script.
 * 4. Haz clic en el icono de guardar (disco) y luego en el botón "Ejecutar" (Run).
 * 5. Concede los permisos necesarios (Configuración avanzada -> Ir a Proyecto sin título -> Permitir).
 * 6. Las encuestas aparecerán en tu Google Drive y verás los enlaces en el registro de ejecución.
 */

function crearFormulariosTesis() {
  // =========================================================================
  // 📋 FORMULARIO 1: ENCUESTA PARA DOCENTES
  // =========================================================================
  var formDocentes = FormApp.create('Encuesta - Gestión Académica y Comunicación Escolar (Docentes)');
  formDocentes.setDescription('Esta encuesta es parte de un trabajo de titulación sobre una plataforma web de gestión académica. Tus respuestas son anónimas y se usarán solo con fines académicos. Tiempo estimado: 3 minutos.');
  
  // 1. Institución
  formDocentes.addTextItem()
    .setTitle('Institución donde trabaja actualmente')
    .setRequired(true);
    
  // 2. Experiencia
  var q2 = formDocentes.addMultipleChoiceItem();
  q2.setTitle('¿Cuántos años de experiencia docente tiene?')
    .setChoices([
      q2.createChoice('Menos de 5 años'),
      q2.createChoice('5 a 10 años'),
      q2.createChoice('11 a 20 años'),
      q2.createChoice('Más de 20 años')
    ])
    .setRequired(true);
    
  // 3. Método de gestión actual
  var q3 = formDocentes.addMultipleChoiceItem();
  q3.setTitle('Actualmente, la gestión de sus calificaciones y asistencia la realiza principalmente a través de:')
    .setChoices([
      q3.createChoice('Planillas de papel o cuadernos'),
      q3.createChoice('Hojas de cálculo (Excel, Google Sheets)'),
      q3.createChoice('Un sistema digital o plataforma proporcionada por la institución'),
      q3.createChoice('Otros')
    ])
    .setRequired(true);
    
  // 4. Eficiencia de comunicación
  var q4 = formDocentes.addMultipleChoiceItem();
  q4.setTitle('¿Qué tan eficiente es para usted el proceso de comunicar novedades (anuncios, tareas, observaciones) a sus estudiantes y padres?')
    .setChoices([
      q4.createChoice('Muy eficiente, uso un canal establecido y la información llega a todos'),
      q4.createChoice('Es aceptable, pero a veces la información no es recibida por todos'),
      q4.createChoice('Poco eficiente, debo usar múltiples canales y es disperso'),
      q4.createChoice('Muy ineficiente, es una de mis principales dificultades')
    ])
    .setRequired(true);
    
  // 5. Herramienta útil de seguimiento
  var q5 = formDocentes.addMultipleChoiceItem();
  q5.setTitle('¿Qué herramienta considera más útil para realizar el seguimiento integral del rendimiento de un estudiante?')
    .setChoices([
      q5.createChoice('Un sistema que consolide automáticamente calificaciones, asistencia y observaciones'),
      q5.createChoice('Un espacio digital para registrar observaciones conductuales'),
      q5.createChoice('La revisión manual de mi cuaderno de planillas'),
      q5.createChoice('Las reuniones periódicas con padres y coordinación')
    ])
    .setRequired(true);
    
  // 6. Funcionalidad más valiosa
  var q6 = formDocentes.addMultipleChoiceItem();
  q6.setTitle('¿Qué funcionalidad sería más valiosa para usted en una nueva plataforma escolar?')
    .setChoices([
      q6.createChoice('Registro centralizado de calificaciones y tareas por materia'),
      q6.createChoice('Un tablero con el perfil académico completo de cada estudiante'),
      q6.createChoice('Herramientas para crear y calificar evaluaciones de forma digital (cuestionarios auto-calificables)'),
      q6.createChoice('Consulta de horarios y planificación de clases')
    ])
    .setRequired(true);
    
  // 7. Usabilidad (Escala 1-5)
  formDocentes.addScaleItem()
    .setTitle('En una escala del 1 al 5, ¿qué tan fácil le resultó usar la plataforma? (solo si ya probó la aplicación)')
    .setBounds(1, 5)
    .setLabels('Muy difícil', 'Muy fácil')
    .setRequired(false);
    
  // 8. Comentarios
  formDocentes.addParagraphTextItem()
    .setTitle('Comentario u observación adicional (opcional)')
    .setRequired(false);

  // =========================================================================
  // 🎓 FORMULARIO 2: ENCUESTA PARA ESTUDIANTES
  // =========================================================================
  var formEstudiantes = FormApp.create('Encuesta - Plataforma Escolar (Estudiantes)');
  formEstudiantes.setDescription('Ayúdanos respondiendo estas preguntas sobre cómo llevas tus tareas y calificaciones. Es anónimo y toma 2 minutos.');
  
  // 1. Curso
  formEstudiantes.addTextItem()
    .setTitle('¿En qué curso/paralelo estás? (ej. 8vo A)')
    .setRequired(true);
    
  // 2. Seguimiento actual
  var q2e = formEstudiantes.addMultipleChoiceItem();
  q2e.setTitle('Actualmente, ¿cómo realizas el seguimiento de tus calificaciones, tareas y fechas de entrega?')
    .setChoices([
      q2e.createChoice('Apuntes en una agenda o cuaderno'),
      q2e.createChoice('Documentos o recordatorios en mi celular'),
      q2e.createChoice('Preguntando directamente a mis profesores o compañeros'),
      q2e.createChoice('A través de una plataforma o grupo digital (Google Classroom, WhatsApp, etc.)')
    ])
    .setRequired(true);
    
  // 3. Acceso a reportes oficiales
  var q3e = formEstudiantes.addMultipleChoiceItem();
  q3e.setTitle('¿Qué tan sencillo es para ti o tu familia obtener información oficial sobre tu rendimiento (boletines, reportes)?')
    .setChoices([
      q3e.createChoice('Muy sencillo, siempre está disponible o se entrega puntualmente'),
      q3e.createChoice('Sencillo, pero a veces hay que solicitarla o esperar reuniones'),
      q3e.createChoice('Difícil, la información es escasa o llega tarde'),
      q3e.createChoice('Muy difícil, casi no hay comunicación formal')
    ])
    .setRequired(true);
    
  // 4. Información deseada en tiempo real
  var q4e = formEstudiantes.addMultipleChoiceItem();
  q4e.setTitle('¿Qué información te gustaría tener más accesible y en tiempo real?')
    .setChoices([
      q4e.createChoice('Mis calificaciones desglosadas por materia y evaluación'),
      q4e.createChoice('El registro de mi asistencia'),
      q4e.createChoice('Recordatorios de tareas pendientes y fechas de exámenes'),
      q4e.createChoice('Mi horario de clases')
    ])
    .setRequired(true);
    
  // 5. Funcionalidad más útil
  var q5e = formEstudiantes.addMultipleChoiceItem();
  q5e.setTitle('¿Cuál de estas funcionalidades te resultó más útil al usar la plataforma? (si ya la probaste)')
    .setChoices([
      q5e.createChoice('Ver mis notas y calificaciones'),
      q5e.createChoice('Entregar tareas en línea'),
      q5e.createChoice('Responder cuestionarios y ver mi nota al instante'),
      q5e.createChoice('Ver mi horario semanal')
    ])
    .setRequired(false);
    
  // 6. Usabilidad (Escala 1-5)
  formEstudiantes.addScaleItem()
    .setTitle('En una escala del 1 al 5, ¿qué tan fácil te resultó usar la plataforma? (si ya la probaste)')
    .setBounds(1, 5)
    .setLabels('Muy difícil', 'Muy fácil')
    .setRequired(false);
    
  // 7. Comentarios
  formEstudiantes.addParagraphTextItem()
    .setTitle('Comentario adicional (opcional)')
    .setRequired(false);
    
  // Mostrar enlaces en la consola
  Logger.log('=== ¡PROCESO COMPLETADO! ===');
  Logger.log('1. ENLACE EDICIÓN DOCENTES: ' + formDocentes.getEditUrl());
  Logger.log('1. ENLACE PÚBLICO DOCENTES: ' + formDocentes.getPublishedUrl());
  Logger.log('----------------------------------------------------');
  Logger.log('2. ENLACE EDICIÓN ESTUDIANTES: ' + formEstudiantes.getEditUrl());
  Logger.log('2. ENLACE PÚBLICO ESTUDIANTES: ' + formEstudiantes.getPublishedUrl());
}
