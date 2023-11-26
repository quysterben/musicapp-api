import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLE_KEY } from '../decorators/role.decorator'
import { Role } from 'src/user/entities/user.entity'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requireRole = this.reflector.getAllAndOverride<Role>(ROLE_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (!requireRole) {
      return true
    }

    const { user }: any = context.switchToHttp().getRequest()

    return user.role === requireRole
  }
}
