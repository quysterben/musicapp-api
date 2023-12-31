import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Song } from 'src/song/entities/song.entity'
import { User } from 'src/user/entities/user.entity'
import { Repository } from 'typeorm'
import { Playlist } from './entities/playlist.entity'
import { CreatePlaylistDto } from './dto/create-playlist.dto'
import { UpdatePlaylistDto } from './dto/update-playlist.dto'
import { AddSongDto } from './dto/add-song.dto'
import { RemoveSongDto } from './dto/remove-song.dto'

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Song) private songRepo: Repository<Song>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Playlist) private playlistRepo: Repository<Playlist>
  ) {}

  async create(createPlaylistDto: CreatePlaylistDto, user: User): Promise<any> {
    return await this.playlistRepo.save({ ...createPlaylistDto, user })
  }

  async getAllByUserId(user: User): Promise<any> {
    try {
      return await this.playlistRepo.find({
        where: {
          user: {
            id: user.id
          }
        },
        relations: {
          songs: true,
          user: true
        },
        order: {
          created_at: 'ASC',
          songs: {
            name: 'ASC'
          }
        },
        select: {
          user: {
            id: true,
            first_name: true,
            last_name: true,
            avatar: true,
            email: true
          }
        }
      })
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  async getById(playlistId: number, user: User): Promise<any> {
    const playlist = await this.playlistRepo.findOne({
      where: { id: playlistId },
      relations: {
        songs: true,
        user: true
      },
      select: {
        user: {
          id: true
        }
      },
      order: {
        songs: {
          name: 'ASC'
        }
      }
    })

    if (!playlist) {
      throw new NotFoundException('Playlist not found !')
    }

    if (playlist.user.id !== user.id) {
      throw new BadRequestException('you can not access this playlist')
    }

    return playlist
  }

  async update(updatePlaylistDto: UpdatePlaylistDto, playlistId: number, user: User): Promise<any> {
    const playlist = await this.playlistRepo.findOne({
      where: { id: playlistId },
      relations: {
        user: true
      },
      select: {
        user: {
          id: true
        }
      }
    })

    if (!playlist) {
      throw new NotFoundException('Playlist not found !')
    }

    if (playlist.user.id !== user.id) {
      throw new ForbiddenException('you can not access this playlist')
    }

    return await this.playlistRepo.update(playlistId, updatePlaylistDto)
  }

  async delete(playlistId: number, user: User): Promise<any> {
    const playlist = await this.playlistRepo.findOne({
      where: { id: playlistId },
      relations: {
        user: true
      },
      select: {
        user: {
          id: true
        }
      }
    })

    if (!playlist) {
      throw new NotFoundException('Playlist not found !')
    }

    if (playlist.user.id !== user.id) {
      throw new ForbiddenException('you can not access this playlist')
    }

    return this.playlistRepo.delete(playlistId)
  }

  async addSong(addSongDto: AddSongDto, user: User): Promise<any> {
    const playlist = await this.playlistRepo.findOne({
      where: {
        id: addSongDto.playlistId
      },
      relations: {
        user: true,
        songs: true
      },
      select: {
        user: {
          id: true
        }
      },
      order: {
        songs: {
          name: 'ASC'
        }
      }
    })

    const song = await this.songRepo.findOneBy({ id: addSongDto.songId })

    if (!song) {
      throw new NotFoundException('Song not found !')
    }

    if (!playlist) {
      throw new NotFoundException('Playlist not found !')
    }

    if (playlist.user.id !== user.id) {
      throw new BadRequestException('you can not access this playlist')
    }

    if (!(playlist.songs.findIndex(val => val.id === song.id) > -1)) {
      playlist.songs.push(song)
    } else {
      throw new BadRequestException('Song existed in playlist !')
    }

    return await this.playlistRepo.save(playlist)
  }

  async removeSong(removeSongDto: RemoveSongDto, user: User): Promise<any> {
    const playlist = await this.playlistRepo.findOne({
      where: {
        id: removeSongDto.playlistId
      },
      relations: {
        user: true,
        songs: true
      },
      select: {
        user: {
          id: true
        }
      }
    })

    const song = await this.songRepo.findOneBy({ id: removeSongDto.songId })

    if (!song) {
      throw new NotFoundException('Song not found !')
    }

    if (!playlist) {
      throw new NotFoundException('Playlist not found !')
    }

    if (playlist.user.id !== user.id) {
      throw new BadRequestException('you can not access this playlist')
    }

    if (playlist.songs.findIndex(val => val.id === song.id) > -1) {
      playlist.songs = playlist.songs.filter(val => val.id !== song.id)
    } else {
      throw new NotFoundException('Song not existed in playlist !')
    }

    return await this.playlistRepo.save(playlist)
  }
}
