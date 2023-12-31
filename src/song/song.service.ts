import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Song } from './entities/song.entity'
import { Like, Repository } from 'typeorm'
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

  async getAllSong(isFetchTop10?: boolean): Promise<any> {
    if (isFetchTop10) {
      return await this.songRepo
        .createQueryBuilder('song')
        .leftJoinAndSelect('song.user', 'user')
        .orderBy('song.likes', 'DESC')
        .limit(10)
        .getMany()
    }

    return await this.songRepo
      .createQueryBuilder('song')
      .leftJoinAndSelect('song.user', 'user')
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
      throw new NotFoundException('Song not found!!')
    }
    return song
  }

  async getSongRecent(userId: number): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { recentSongs: true }
    })

    if (!user) {
      throw new NotFoundException('User not found!!')
    }

    return user.recentSongs
  }

  async getSongByUserId(userId: number): Promise<any> {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: { songs: true }
      })
      if (!user) {
        throw new NotFoundException('User not found!!')
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

  async searchSongs(keyword: string) {
    return await this.songRepo.find({
      where: {
        name: Like(`%${keyword}%`)
      }
    })
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

    if (!song) {
      throw new NotFoundException('Song not found!')
    }

    if (song) {
      if (song.user.id !== user.id) {
        throw new ForbiddenException('You do not have permission!')
      }

      // await this.cloudinary.destroyFile(song.url, 'audio')
      // await this.cloudinary.destroyFile(song.artwork, 'image-art')
    }

    return this.songRepo.delete(songId)
  }

  async changeFavorite(userId: number, songId: number): Promise<any> {
    const promises = []
    try {
      let isFavorited: number = -1
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
      if (!song) {
        throw new NotFoundException('Song not found')
      }
      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: { favoriteSongs: true }
      })

      if (user) {
        isFavorited = user.favoriteSongs.findIndex(item => {
          return item.id === song.id
        })

        if (isFavorited > -1) {
          user.favoriteSongs = user.favoriteSongs.filter(item => item.id !== song.id)
        } else {
          user.favoriteSongs.push(song)
        }
      }

      // create notification
      if (isFavorited < 0 && user.id !== song.user.id) {
        promises.push(
          this.notiRepo.save({
            content: `${user.first_name} đã thêm bài ${song.name} vào danh sách yêu thích`,
            user: song.user
          })
        )

        this.eventGateway.handleEmitSocket({
          data: `${user.first_name} đã thêm bài ${song.name} vào danh sách yêu thích`,
          event: 'notify',
          to: song.user.email
        })
      }

      if (isFavorited > -1 && user.id !== song.user.id) {
        const str = `${user.first_name} đã thêm bài ${song.name}`
        const notifi = await this.notiRepo.findOne({
          where: {
            content: Like(`%${str}%`)
          }
        })

        promises.push(this.notiRepo.delete(notifi.id))
      }

      if (isFavorited > -1) {
        song.likes -= 1
      } else {
        song.likes += 1
      }

      promises.push(this.songRepo.save(song))
      promises.push(this.userRepo.save(user))

      const result = await Promise.all(promises)

      return {
        success: true,
        result: {
          favorited: isFavorited > -1 ? false : true,
          response: user.id !== song.user.id ? result[2] : result[1]
        }
      }
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  async addRecentSong(userId: number, songId: number): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { recentSongs: true }
    })

    const song = await this.songRepo.findOne({
      where: { id: songId }
    })

    if (!song) {
      throw new NotFoundException('Song not found')
    }

    const newRecentSongs = user.recentSongs.filter(item => item.id !== song.id)

    newRecentSongs.unshift(song)

    if (newRecentSongs.length > 10) {
      newRecentSongs.pop()
    }

    user.recentSongs = newRecentSongs

    return await this.userRepo.save(user)
  }
}
