import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-jwt'
import { TOKEN_NAME } from 'src/constants/conts'
import { UserService } from 'src/user/user.service'

const cookieExtractor = (req: any) => {
  let token = null
  if (req && req.cookies) {
    token = req.cookies[TOKEN_NAME]
  }
  return token
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || '1234'
    })
  }

  async validate(payload: any) {
    const user = await this.userService.findOne(payload.sub)
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }
}
