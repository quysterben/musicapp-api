import { Module } from '@nestjs/common'
import { EventGateway } from './gateway'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  imports: [JwtModule.register({ global: true }), ConfigModule, AuthModule],
  providers: [EventGateway]
})
export class GatewayModule {}
