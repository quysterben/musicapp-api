import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { FilterUserDto } from './dto/filter-user.dto'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'

import { CloudinaryService } from 'src/cloudinary/cloudinary.service'

import { GetUserRequest, RoleRequire } from 'src/auth/decorators'
import { Role, User } from './entities/user.entity'
import { filterImageConfig, storageConfig } from 'helpers/upload-file-config'

@ApiBearerAuth()
@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private cloudinaryService: CloudinaryService
  ) {}

  @RoleRequire(Role.Admin)
  @Get()
  async getAllUser(@Query() query: FilterUserDto) {
    return {
      success: true,
      result: await this.userService.getAllUser(query)
    }
  }

  @Get(':id')
  async getUser(@GetUserRequest() user: User, @Param('id', ParseIntPipe) id: number) {
    if (user.id === id || user.role === Role.Admin) {
      return {
        success: true,
        result: await this.userService.getUser(id)
      }
    } else {
      throw new BadRequestException('You do not have permission!')
    }
  }

  @Post('curr/info')
  async getCurrUser(@GetUserRequest() user: User, @Body() body: any) {
    const userDetail = await this.userService.getCurrUser(user.id, body.astist)
    return {
      success: true,
      result: userDetail
    }
  }

  @RoleRequire(Role.Admin)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return {
      success: true,
      result: await this.userService.create(createUserDto)
    }
  }

  @Put(':id')
  async update(
    @GetUserRequest() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    if (user.id !== id) {
      throw new BadRequestException('You do not have permission!')
    }
    return {
      success: true,
      result: await this.userService.update(id, updateUserDto)
    }
  }

  @RoleRequire(Role.Admin)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return {
      success: true,
      result: await this.userService.delete(id)
    }
  }

  @Post('upload-avt')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: storageConfig('avatars'),
      fileFilter: filterImageConfig()
    })
  )
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError)
    }

    if (!file) {
      throw new BadRequestException('File is required')
    }

    const cloudFile = await this.cloudinaryService.uploadFile(file, 'image-avt')

    return {
      success: true,
      result: await this.userService.updateAvatar(req.user.id, cloudFile.secure_url)
    }
  }
}
