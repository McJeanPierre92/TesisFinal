import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CAPTURAS_DIR = path.join(__dirname, '..', 'capturas');

if (!fs.existsSync(CAPTURAS_DIR)) {
  fs.mkdirSync(CAPTURAS_DIR, { recursive: true });
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function hideDevTools(page) {
  try {
    await page.addStyleTag({
      content: `
        next-route-announcer { display: none !important; }
        #__next-feedback, [id^="nextjs-"] { display: none !important; }
        button[aria-label="Open Next.js Dev Tools"] { display: none !important; }
        #nextjs-portal { display: none !important; }
      `
    });
  } catch (e) {
    // Ignore if styling fails
  }
}

async function loginAndGo(browser, username, password, subtaskCallback) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  console.log(`[AUTH] Iniciando sesión para: ${username}...`);
  await page.goto('http://localhost:3006/login');
  await page.waitForSelector('input[placeholder="Usuario"]');
  
  await page.fill('input[placeholder="Usuario"]', username);
  await page.fill('input[placeholder="Contraseña"]', password);
  
  await delay(200);
  await page.click('button:has-text("Iniciar Sesión")');
  
  // Wait for the URL to change to something other than /login
  await page.waitForURL((url) => !url.href.endsWith('/login'), { timeout: 10000 });
  await delay(1500); // Allow animations to finish
  await hideDevTools(page);
  
  await subtaskCallback(page);
  
  await context.close();
}

async function run() {
  console.log('Iniciando proceso de captura de interfaces...');
  const browser = await chromium.launch({ headless: true });

  try {
    // ----------------------------------------------------
    // PANTALLA DE LOGIN (Sin autenticación)
    // ----------------------------------------------------
    console.log('[CAPTURA] Tomando captura de pantalla de Login...');
    const loginContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const loginPage = await loginContext.newPage();
    await loginPage.goto('http://localhost:3006/login');
    await loginPage.waitForSelector('input[placeholder="Usuario"]');
    await delay(1500);
    await hideDevTools(loginPage);
    await loginPage.screenshot({ path: path.join(CAPTURAS_DIR, '01-login.png') });
    await loginContext.close();
    console.log('[OK] 01-login.png guardado.');

    // ----------------------------------------------------
    // FLUJO ADMINISTRADOR
    // ----------------------------------------------------
    await loginAndGo(browser, 'admin', '123456', async (page) => {
      // 02-perfil-usuario.png
      console.log('[CAPTURA] Tomando perfil de usuario...');
      await page.goto('http://localhost:3006/lms/profile');
      await delay(1500);
      await hideDevTools(page);
      await page.screenshot({ path: path.join(CAPTURAS_DIR, '02-perfil-usuario.png') });
      console.log('[OK] 02-perfil-usuario.png guardado.');

      // 03-admin-dashboard.png
      console.log('[CAPTURA] Tomando Dashboard Admin...');
      await page.goto('http://localhost:3006/lms');
      await delay(2000); // Más tiempo para que los gráficos carguen
      await hideDevTools(page);
      await page.screenshot({ path: path.join(CAPTURAS_DIR, '03-admin-dashboard.png') });
      console.log('[OK] 03-admin-dashboard.png guardado.');

      // Rutas de administración
      const adminRoutes = [
        { route: '/lms/admin/institutions', file: '04-admin-instituciones.png' },
        { route: '/lms/admin/levels', file: '05-admin-niveles.png' },
        { route: '/lms/admin/subjects', file: '06-admin-materias.png' },
        { route: '/lms/admin/class-groups', file: '07-admin-paralelos.png' },
        { route: '/lms/admin/students', file: '08-admin-estudiantes.png' },
        { route: '/lms/admin/teachers', file: '09-admin-profesores.png' },
        { route: '/lms/admin/enrollments', file: '10-admin-matriculas.png' },
        { route: '/lms/admin/teaching-assignments', file: '11-admin-asignaciones.png' },
        { route: '/lms/admin/schedule', file: '12-admin-horarios.png' }
      ];

      for (const item of adminRoutes) {
        console.log(`[CAPTURA] Navegando a ${item.route}...`);
        await page.goto(`http://localhost:3006${item.route}`);
        await delay(1500);
        await hideDevTools(page);
        await page.screenshot({ path: path.join(CAPTURAS_DIR, item.file) });
        console.log(`[OK] ${item.file} guardado.`);
      }
    });

    // ----------------------------------------------------
    // FLUJO PROFESOR
    // ----------------------------------------------------
    await loginAndGo(browser, 'profesor', '123456', async (page) => {
      // 13-profesor-dashboard.png
      console.log('[CAPTURA] Tomando Dashboard Profesor...');
      await page.goto('http://localhost:3006/lms');
      await delay(1500);
      await hideDevTools(page);
      await page.screenshot({ path: path.join(CAPTURAS_DIR, '13-profesor-dashboard.png') });
      console.log('[OK] 13-profesor-dashboard.png guardado.');

      // Rutas de profesor
      const teacherRoutes = [
        { route: '/lms/teacher/assignments', file: '14-profesor-clases.png' },
        { route: '/lms/teacher/grading', file: '15-profesor-calificaciones.png' },
        { route: '/lms/teacher/schedule', file: '16-profesor-horario.png' }
      ];

      for (const item of teacherRoutes) {
        console.log(`[CAPTURA] Navegando a ${item.route}...`);
        await page.goto(`http://localhost:3006${item.route}`);
        await delay(1500);
        await hideDevTools(page);
        await page.screenshot({ path: path.join(CAPTURAS_DIR, item.file) });
        console.log(`[OK] ${item.file} guardado.`);
      }
    });

    // ----------------------------------------------------
    // FLUJO ALUMNO
    // ----------------------------------------------------
    await loginAndGo(browser, 'alumno', '123456', async (page) => {
      // 17-alumno-dashboard.png
      console.log('[CAPTURA] Tomando Dashboard Alumno...');
      await page.goto('http://localhost:3006/lms');
      await delay(2000); // Para los gráficos del alumno
      await hideDevTools(page);
      await page.screenshot({ path: path.join(CAPTURAS_DIR, '17-alumno-dashboard.png') });
      console.log('[OK] 17-alumno-dashboard.png guardado.');

      // 18-alumno-cursos.png
      console.log('[CAPTURA] Navegando a Mis Cursos...');
      await page.goto('http://localhost:3006/lms/my-courses');
      await page.waitForSelector('a[href^="/lms/my-courses/"]', { timeout: 5000 }).catch(() => {});
      await delay(1500);
      await hideDevTools(page);
      await page.screenshot({ path: path.join(CAPTURAS_DIR, '18-alumno-cursos.png') });
      console.log('[OK] 18-alumno-cursos.png guardado.');

      // 19-alumno-detalle-curso.png (Clic en el primer curso disponible)
      console.log('[CAPTURA] Entrando al detalle de un curso...');
      const firstCourseLink = await page.$('a[href^="/lms/my-courses/"]');
      if (firstCourseLink) {
        await firstCourseLink.click();
        await page.waitForURL((url) => url.pathname.startsWith('/lms/my-courses/'), { timeout: 5000 });
        await delay(1500);
        await hideDevTools(page);
        await page.screenshot({ path: path.join(CAPTURAS_DIR, '19-alumno-detalle-curso.png') });
        console.log('[OK] 19-alumno-detalle-curso.png guardado.');
      } else {
        console.warn('[ALERTA] No se encontró ningún curso para hacer clic. Se omite 19-alumno-detalle-curso.png');
      }

      // Rutas de alumno adicionales
      const studentRoutes = [
        { route: '/lms/my-grades', file: '20-alumno-calificaciones.png' },
        { route: '/lms/my-schedule', file: '21-alumno-horario.png' }
      ];

      for (const item of studentRoutes) {
        console.log(`[CAPTURA] Navegando a ${item.route}...`);
        await page.goto(`http://localhost:3006${item.route}`);
        await delay(1500);
        await hideDevTools(page);
        await page.screenshot({ path: path.join(CAPTURAS_DIR, item.file) });
        console.log(`[OK] ${item.file} guardado.`);
      }
    });

    console.log('[PROCESO COMPLETADO] Todas las capturas se guardaron en la carpeta capturas/');

  } catch (error) {
    console.error('Error durante la ejecución del script de capturas:', error);
  } finally {
    await browser.close();
  }
}

run();
