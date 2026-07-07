import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UserService } from '../user/user.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async signIn(userName: string, pass: string): Promise<{ sessionId: string }> {
    const user = await this.userService.findOneByUserName({
      userName,
      state: true
    })
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Credenciales incorrectas')
    }
    const { password, id, ...result } = user

    const permissions =
      user.role.permissions
        ?.filter((rp: any) => rp.state === true)
        .map((rp: any) => rp.permission.name) || []

    const payload = {
      sub: id,
      userName: result.userName,
      permissions,
      roleId: result.roleId
    }

    return {
      sessionId: this.jwtService.sign(payload)
    }
  }

  /**
   * Cambia la contraseña del usuario autenticado.
   * Verifica la contraseña actual con bcrypt.compare (igual que signIn),
   * luego delega a userService.update que re-hasea con el mismo salt rounds.
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await this.userService.findOne(userId)
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado')
    }

    // user.password no viene en el select de findOne; lo cargamos crudo.
    const raw = await this.userService.findOneByUserName({
      userName: user.userName,
      state: true
    })
    if (!raw || !(await bcrypt.compare(currentPassword, raw.password))) {
      throw new UnauthorizedException('La contraseña actual es incorrecta')
    }

    await this.userService.update(userId, { password: newPassword } as any)
    return { message: 'Contraseña actualizada correctamente' }
  }
}
