import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'
import { json, NextFunction, Request, Response, urlencoded } from 'express'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { DuplicateRequestInterceptor } from './interceptor/duplicate-request.interceptor'
import { GlobalExceptionFilter } from './middleware/exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Increase body size limit to handle large payloads (e.g. many analysis details)
  app.use(json({ limit: '10mb' }))
  app.use(urlencoded({ limit: '10mb', extended: true }))

  app.use(cookieParser())
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: 406
    })
  )
  app.useGlobalInterceptors(new DuplicateRequestInterceptor())
  app.useGlobalFilters(new GlobalExceptionFilter())

  app.setGlobalPrefix('v1/promo/api')

  app.enableCors({
    origin: [process.env.FRONTEND_URL, process.env.FRONT_URL].filter(Boolean),
    credentials: true
  })
  app.use(
    helmet({
      referrerPolicy: { policy: 'same-origin' },
      hsts: { maxAge: 300, includeSubDomains: true, preload: true },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'nonce-{placeholder}'`], // Usa nonces en lugar de unsafe-inline
          scriptSrc: [`'self'`, `'strict-dynamic'`], // Elimina unsafe-eval si es posible
          imgSrc: [`'self'`, 'data:', 'https:'],
          connectSrc: [`'self'`, process.env.FRONT_URL],
          fontSrc: [`'self'`, 'fonts.gstatic.com'],
          objectSrc: [`'none'`],
          upgradeInsecureRequests: []
        }
      },
      // Headers adicionales recomendados
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-origin' },
      originAgentCluster: true,
      xContentTypeOptions: true,
      xDnsPrefetchControl: { allow: false }, // Desactiva si no usas prefetch
      xDownloadOptions: true,
      xFrameOptions: { action: 'deny' }, // Más estricto que sameorigin
      xPermittedCrossDomainPolicies: { permittedPolicies: 'none' },
      xXssProtection: true
    })
  )
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Prevenir cache de respuestas con datos sensibles
    if (req.path.includes('/api') || req.headers.authorization) {
      res.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, private'
      )
      res.setHeader('Pragma', 'no-cache')
      res.setHeader('Expires', '0')
    }

    // Prevenir leakage por referer
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Políticas de permisos restrictivas
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()'
    )
    res.setHeader('X-Content-Type-Options', 'nosniff')
    next()
  })

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Quality App')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description:
            'El JWT se entrega vía cookie httpOnly al hacer login (POST /auth/login). Este esquema se documenta para que /docs permita probar endpoints.'
        },
        'access-token'
      )
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true }
    })
  }

  await app.listen(process.env.PORT)
}
bootstrap()
