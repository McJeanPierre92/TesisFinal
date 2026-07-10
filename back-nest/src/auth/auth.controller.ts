import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Prisma } from '@prisma/client'
import { Request, Response } from 'express'
import { TOKEN_NAME } from 'src/constants/conts'
import { AuthService } from './auth.service'
import { ChangePasswordDto } from './dto/change-password.dto'
import { LoginDto } from './dto/login.dto'

export interface RequestWithUser extends Request {
  user: Prisma.userUncheckedCreateInput
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.signIn(
      loginDto.userName,
      loginDto.password
    )
    const isSecure = process.env.FRONTEND_URL?.startsWith('https');
    res.cookie(TOKEN_NAME, result.sessionId, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000
    })

    return {
      message: 'Login Success'
    }
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: RequestWithUser) {
    return req.user
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    const isSecure = process.env.FRONTEND_URL?.startsWith('https');
    res.cookie(TOKEN_NAME, '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax',
      expires: new Date(0)
    })
    return { message: 'Sesión cerrada correctamente' }
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  changePassword(
    @Req() req: RequestWithUser,
    @Body() dto: ChangePasswordDto
  ) {
    return this.authService.changePassword(
      Number(req.user.id),
      dto.currentPassword,
      dto.newPassword
    )
  }
}
