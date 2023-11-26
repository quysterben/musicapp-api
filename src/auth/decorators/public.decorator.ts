import { SetMetadata } from '@nestjs/common'

export const Public = (isPublic: boolean) => SetMetadata('isPublic', isPublic)
