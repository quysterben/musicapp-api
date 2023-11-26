import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { dataSourceOptions } from 'db/data-source'
import { ConfigModule } from '@nestjs/config'
import { UserModule } from './user/user.module'
import { PlaylistModule } from './playlist/playlist.module'
import { SongModule } from './song/song.module'
import { CloudinaryModule } from './cloudinary/cloudinary.module'
import { GatewayModule } from './gateway/gateway.module'
import { AuthModule } from './auth/auth.module'
import { NotificationModule } from './notification/notification.module'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './auth/guards/jwt.guard'
import { RolesGuard } from './auth/guards/roles.guard'

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    PlaylistModule,
    SongModule,
    CloudinaryModule,
    GatewayModule,
    AuthModule,
    NotificationModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ]
})
export class AppModule {}
