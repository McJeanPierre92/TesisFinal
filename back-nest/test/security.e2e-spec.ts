import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'

describe('Security Controls (E2E)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = module.createNestApplication()
    await app.init()
  })

  it('should block requests with HTML tags (XSS)', async () => {
    return request(app.getHttpServer())
      .post('/v1/promo/api/users')
      .send({
        name: '<script>alert("xss")</script>',
        email: 'test@example.com'
      })
      .expect(406) // ValidationPipe + SanitizePipe deberían rechazar
  })

  it('should rate limit after N requests', async () => {
    // Hacer 35 requests en menos de 60 segundos
    const promises = Array(35)
      .fill(0)
      .map(() => request(app.getHttpServer()).get('/v1/promo/api/health'))

    const responses = await Promise.all(promises)
    const rateLimited = responses.filter((r) => r.status === 429)

    expect(rateLimited.length).toBeGreaterThan(0)
  })

  afterAll(async () => {
    await app.close()
  })
})
