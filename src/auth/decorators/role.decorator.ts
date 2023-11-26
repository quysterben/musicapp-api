import { SetMetadata } from '@nestjs/common'
import { Role } from 'src/user/entities/user.entity'

export const ROLE_KEY = 'role'
export const RoleRequire = (role: Role) => SetMetadata(ROLE_KEY, role)
