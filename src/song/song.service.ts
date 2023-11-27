import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Song } from './entities/song.entity'
import { Repository } from 'typeorm'
import { CreateBulkSongDto } from './dto/create-bulk-song.dto'
import { User } from 'src/user/entities/user.entity'
import { Notification } from 'src/notification/entities/notification.entity'
import { CreateSongDto } from './dto/create-song.dto'
import { CloudinaryService } from 'src/cloudinary/cloudinary.service'
import { UpdateSongDto } from './dto/update-song.dto'
import { EventGateway } from 'src/gateway/gateway'
@Injectable()
export class SongService {
  constructor(
    @InjectRepository(Song) private songRepo: Repository<Song>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Notification) private notiRepo: Repository<Notification>,
    private cloudinary: CloudinaryService,
    private eventGateway: EventGateway
  ) {}

  async create(createSongDto: CreateSongDto, user: User): Promise<any> {
    return await this.songRepo.save({ ...createSongDto, user })
  }

  async createBulk(createBulkSongDto: CreateBulkSongDto, user: User): Promise<any> {
    let bulkData = []

    if (user) {
      bulkData = createBulkSongDto.songs.map(song => {
        return {
          ...song,
          user
        }
      })
    }

    return await this.songRepo.createQueryBuilder().insert().into(Song).values(bulkData).execute()
  }

  async getAllSong(): Promise<any> {
    return await this.songRepo
      .createQueryBuilder('song')
      .leftJoinAndSelect('song.user', 'user')
      .leftJoinAndSelect('song.likedUsers', 'likedUsers')
      .loadRelationCountAndMap('song.likedUsers', 'song.likedUsers')
      .orderBy('song.name', 'ASC')
      .getMany()
  }

  async getSong(songId: number): Promise<any> {
    const song = await this.songRepo
      .createQueryBuilder('song')
      .where('song.id = :id', { id: songId })
      .leftJoinAndSelect('song.user', 'user')
      .leftJoinAndSelect('song.likedUsers', 'likedUsers')
      .loadRelationCountAndMap('song.likedUsers', 'song.likedUsers')
      .getOne()

    if (!song) {
      throw new HttpException('Song not found!!', HttpStatus.NOT_FOUND)
    }
    return song
  }

  async getSongByUserId(userId: number): Promise<any> {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: { songs: true }
      })
      if (!user) {
        throw new HttpException('user not found !', HttpStatus.NOT_FOUND)
      }
      console.log(user)
      return user.songs
    } catch (error: any) {
      throw new BadRequestException(error.message)
    }
  }

  async update(updateSongDto: UpdateSongDto, songId: number, user: User): Promise<any> {
    const song = await this.songRepo.findOne({
      where: { id: songId },
      relations: {
        user: true
      },
      select: {
        user: {
          id: true,
          first_name: true,
          last_name: true,
          email: true
        }
      }
    })

    if (!song) {
      throw new NotFoundException('Song not found!')
    }

    if (song.user.id !== user.id) {
      throw new BadRequestException('You do not have permission!')
    }

    return this.songRepo.update(songId, updateSongDto)
  }

  async delete(songId: number, user: User): Promise<any> {
    const song = await this.songRepo.findOne({
      where: {
        id: songId
      },
      relations: {
        user: true
      },
      select: {
        user: {
          id: true,
          first_name: true,
          last_name: true,
          email: true
        }
      }
    })

    if (song) {
      if (song.user.id !== user.id) {
        throw new BadRequestException('You do not have permission!')
      }

      await this.cloudinary.destroyFile(song.url, 'audio')
      await this.cloudinary.destroyFile(song.artwork, 'image-art')
    }

    return this.songRepo.delete(songId)
  }
}
