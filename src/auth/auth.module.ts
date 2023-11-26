import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/user/entities/user.entity'
import { JwtModule } from '@nestjs/jwt'
import { JwtStratery } from './strateries'
import { JwtRefreshStratery } from './strateries/jwt-refresh.stratery'
import { GoogleStrategy } from './strateries/google.stratery'

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule.register({ global: true })],
  controllers: [AuthController],
  providers: [AuthService, JwtStratery, JwtRefreshStratery, GoogleStrategy]
})
export class AuthModule {}
