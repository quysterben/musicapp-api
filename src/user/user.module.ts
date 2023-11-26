import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { ConfigModule } from '@nestjs/config'
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module'

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule, CloudinaryModule],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
