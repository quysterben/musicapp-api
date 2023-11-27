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
  Request,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { CreateBulkSongDto } from './dto/create-bulk-song.dto'
import { SongService } from './song.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { filterAudioConfig, filterImageConfig, storageConfig } from 'helpers/upload-file-config'
import { CreateSongDto } from './dto/create-song.dto'
import { CloudinaryService } from 'src/cloudinary/cloudinary.service'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UpdateSongDto } from './dto/update-song.dto'
import { Public } from 'src/auth/decorators/public.decorator'
import { GetUserRequest } from 'src/auth/decorators'
import { User } from 'src/user/entities/user.entity'

@ApiTags('Song')
@Controller('songs')
export class SongController {
  constructor(
    private songService: SongService,
    private cloudinaryService: CloudinaryService
  ) {}

  @ApiBearerAuth()
  @Post('bulk')
  createBulk(
    @GetUserRequest() user: User,
    @Body() createBulkSongDto: CreateBulkSongDto
  ): Promise<any> {
    return this.songService.createBulk(createBulkSongDto, user)
  }

  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @Post()
  async create(@GetUserRequest() user: User, @Body() createSongDto: CreateSongDto) {
    const result = await this.songService.create(createSongDto, user)
    result.user = result.user.id
    return {
      success: true,
      result: result
    }
  }

  @ApiBearerAuth()
  @Post('upload-audio')
  @UseInterceptors(
    FileInterceptor('song', {
      storage: storageConfig('audios'),
      fileFilter: filterAudioConfig()
    })
  )
  async uploadAudio(@Request() req: any, @UploadedFile() file: Express.Multer.File): Promise<any> {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError)
    }

    if (!file) {
      throw new BadRequestException('File is required')
    }

    const cloudFile = await this.cloudinaryService.uploadFile(file, 'audio')

    return {
      success: true,
      result: {
        url: cloudFile.secure_url,
        duration: cloudFile.duration
      }
    }
  }

  @ApiBearerAuth()
  @Post('upload-art')
  @UseInterceptors(
    FileInterceptor('artwork', {
      storage: storageConfig('artworks'),
      fileFilter: filterImageConfig()
    })
  )
  async uploadArtwork(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File
  ): Promise<any> {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError)
    }

    if (!file) {
      throw new BadRequestException('File is required')
    }

    const cloudFile = await this.cloudinaryService.uploadFile(file, 'image-art')

    return {
      success: true,
      result: cloudFile.secure_url
    }
  }

  @Public(true)
  @Get()
  async getAllSong(): Promise<any> {
    return {
      success: true,
      result: await this.songService.getAllSong()
    }
  }

  @Public(true)
  @Get('search')
  async searchSongs(@Query() query: any): Promise<any> {
    return {
      success: true,
      result: await this.songService.searchSongs(query.keyword)
    }
  }

  @Public(true)
  @Get(':id')
  async getSong(@Param('id', ParseIntPipe) songId: number): Promise<any> {
    return {
      success: true,
      result: await this.songService.getSong(songId)
    }
  }

  @ApiBearerAuth()
  @Get('user/:userId')
  async getSongByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<any> {
    return {
      success: true,
      result: await this.songService.getSongByUserId(userId)
    }
  }

  @ApiBearerAuth()
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) songId: number,
    @GetUserRequest() user: User,
    @Body() updateSongDto: UpdateSongDto
  ) {
    return {
      success: true,
      result: await this.songService.update(updateSongDto, songId, user)
    }
  }

  @ApiBearerAuth()
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) songId: number, @GetUserRequest() user: User) {
    await this.songService.delete(songId, user)
    return {
      success: true
    }
  }

  @ApiBearerAuth()
  @Get('favorite/:id')
  async changeFavorite(
    @GetUserRequest() user: User,
    @Param('id', ParseIntPipe) songId: number
  ): Promise<any> {
    try {
      return await this.songService.changeFavorite(user.id, songId)
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }
}
