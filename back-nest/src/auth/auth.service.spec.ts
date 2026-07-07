import { UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from 'src/user/user.service'
import { AuthService } from './auth.service'

describe('AuthService', () => {
  let authService: AuthService
  let usersServiceMock: UserService
  let jwtServiceMock: JwtService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOneByUserName: jest.fn(),
            create: jest.fn()
          }
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn()
          }
        }
      ]
    }).compile()

    authService = module.get<AuthService>(AuthService)
    usersServiceMock = module.get<UserService>(UserService)
    jwtServiceMock = module.get<JwtService>(JwtService)
  })

  // it('should sign in a user and return an access token', async () => {
  //   const user = {
  //     // id: 1,
  //     userName: 'testuser',
  //     password: 'password'
  //   }

  //   jest
  //     .spyOn(usersServiceMock, 'findOneByUserName')
  //     .mockImplementation(() => Promise.resolve(user))
  //   jest.spyOn(jwtServiceMock, 'signAsync').mockResolvedValueOnce('token')

  //   const response = await authService.signIn('testuser', 'password')

  //   expect(response).toEqual({ access_token: 'token' })
  // })

  it('should throw an UnauthorizedException if the user cannot be signed in', async () => {
    jest
      .spyOn(usersServiceMock, 'findOneByUserName')
      .mockImplementation(() => Promise.resolve(null))

    await expect(authService.signIn('testuser', 'password')).rejects.toThrow(
      UnauthorizedException
    )
  })

  // it('should sign up a user and return the user', async () => {
  //   const user = {
  //     id: 1,
  //     userName: 'testuser',
  //     password: 'password',
  //     roleId: 1,
  //     name: 'user',
  //     state: true
  //   }

  //   jest
  //     .spyOn(usersServiceMock, 'create')
  //     .mockImplementation(() => Promise.resolve(user))

  //   const response = await usersServiceMock.create('testuser', 'password')

  //   expect(response).toEqual(user)
  //   // expect(response.password).toBeUndefined()
  // })

  it('should throw an InternalServerErrorException if the user cannot be signed up', async () => {
    jest.spyOn(usersServiceMock, 'create').mockRejectedValue(new Error())

    await expect(
      usersServiceMock.create({
        userName: 'testuser',
        password: 'password',
        roleId: 1,
        name: 'user',
        state: true
      })
    ).rejects.toThrow(Error)
  })
})
