import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { DeleteResult, Like, MoreThanOrEqual, Repository, UpdateResult } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { FilterUserDto } from './dto/filter-user.dto'
import { CloudinaryService } from 'src/cloudinary/cloudinary.service'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private cloundaryService: CloudinaryService
  ) {}

  async getAllUser(query: FilterUserDto): Promise<any> {
    const items_per_page = Number(query.items_per_page) || 10
    const page = Number(query.page) || 1
    const keyword = query.search || ''

    const skip = (page - 1) * items_per_page

    const [result, total] = await this.userRepo.findAndCount({
      order: { created_at: 'DESC' },
      take: items_per_page,
      skip: skip,
      where: [
        { first_name: Like('%' + keyword + '%') },
        { last_name: Like('%' + keyword + '%') },
        { email: Like('%' + keyword + '%') }
      ]
    })

    const lastPage = Math.ceil(total / items_per_page)
    const nextPage = page + 1 > lastPage ? null : page + 1
    const prevPage = page - 1 < 1 ? null : page - 1

    return {
      data: result,
      total,
      currentPage: page,
      nextPage,
      lastPage,
      prevPage
    }
  }

  async getUser(id: number): Promise<User> {
    return await this.userRepo.findOne({
      where: {
        id
      },
      relations: {
        songs: true,
        favoriteSongs: true
      },
      order: {
        songs: {
          name: 'ASC'
        },
        favoriteSongs: {
          name: 'ASC'
        }
      }
    })
  }

  async getCurrUser(id: number, astist: any): Promise<User> {
    let filter
    if (astist) {
      filter = {
        id: id,
        favoriteSongs: {
          artist: astist,
          favoriteSongs: {
            likes: MoreThanOrEqual(3)
          }
        }
      }
    } else {
      filter = {
        id: id,
        favoriteSongs: {
          likes: MoreThanOrEqual(3)
        }
      }
    }

    return await this.userRepo.findOne({
      where: filter,
      relations: {
        songs: true,
        favoriteSongs: true
      },
      order: {
        songs: {
          name: 'ASC'
        },
        favoriteSongs: {
          name: 'ASC'
        }
      }
    })
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashPassword = await bcrypt.hash(createUserDto.password, 10)

    return await this.userRepo.save({ ...createUserDto, password: hashPassword })
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UpdateResult> {
    return await this.userRepo.update(id, updateUserDto)
  }

  async delete(id: number): Promise<DeleteResult> {
    const user = await this.userRepo.findOneBy({ id })
    if (user.avatar) {
      await this.cloundaryService.destroyFile(user.avatar, 'image-avt')
    }
    return await this.userRepo.delete(id)
  }

  async updateAvatar(id: number, avatar: string): Promise<UpdateResult> {
    return await this.userRepo.update(id, { avatar })
  }
}
