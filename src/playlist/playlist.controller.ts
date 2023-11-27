import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { PlaylistService } from './playlist.service'
import { CreatePlaylistDto } from './dto/create-playlist.dto'
import { UpdatePlaylistDto } from './dto/update-playlist.dto'
import { AddSongDto } from './dto/add-song.dto'
import { RemoveSongDto } from './dto/remove-song.dto'
import { GetUserRequest } from 'src/auth/decorators'
import { User } from 'src/user/entities/user.entity'

@ApiBearerAuth()
@ApiTags('User')
@Controller('playlists')
export class PlaylistController {
  constructor(private playlistService: PlaylistService) {}

  @UsePipes(ValidationPipe)
  @Post()
  async create(
    @GetUserRequest() user: User,
    @Body() createPlaylistDto: CreatePlaylistDto
  ): Promise<any> {
    return {
      success: true,
      result: await this.playlistService.create(createPlaylistDto, user)
    }
  }

  @Get()
  async getAllByUserId(@GetUserRequest() user: User): Promise<any> {
    return {
      success: true,
      result: await this.playlistService.getAllByUserId(user)
    }
  }

  @Get(':id')
  async getById(
    @GetUserRequest() user: User,
    @Param('id', ParseIntPipe) playlistId: number
  ): Promise<any> {
    return {
      success: true,
      result: await this.playlistService.getById(playlistId, user)
    }
  }

  @UsePipes(ValidationPipe)
  @Put(':id')
  async update(
    @GetUserRequest() user: User,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
    @Param('id', ParseIntPipe) playlistId: number
  ): Promise<any> {
    return {
      success: true,
      result: await this.playlistService.update(updatePlaylistDto, playlistId, user)
    }
  }

  @Delete(':id')
  async delete(
    @GetUserRequest() user: User,
    @Param('id', ParseIntPipe) playlistId: number
  ): Promise<any> {
    return {
      success: true,
      result: await this.playlistService.delete(playlistId, user)
    }
  }

  @UsePipes(ValidationPipe)
  @Patch('add')
  async addSong(@GetUserRequest() user: User, @Body() addSongDto: AddSongDto): Promise<any> {
    return {
      success: true,
      result: await this.playlistService.addSong(addSongDto, user)
    }
  }

  @UsePipes(ValidationPipe)
  @Patch('remove')
  async removeSong(
    @GetUserRequest() user: User,
    @Body() removeSongDto: RemoveSongDto
  ): Promise<any> {
    return {
      success: true,
      result: await this.playlistService.removeSong(removeSongDto, user)
    }
  }
}
