import { Module } from '@nestjs/common'
import { SongController } from './song.controller'
import { SongService } from './song.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Song } from './entities/song.entity'
import { User } from 'src/user/entities/user.entity'
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module'
import { EventGateway } from 'src/gateway/gateway'
import { Notification } from 'src/notification/entities/notification.entity'
@Module({
  imports: [TypeOrmModule.forFeature([Song, User, Notification]), CloudinaryModule],
  controllers: [SongController],
  providers: [SongService, EventGateway]
})
export class SongModule {}
