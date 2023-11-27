import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsUrl } from 'class-validator'

export class UpdateSongDto {
  @ApiProperty()
  name: string

  @ApiProperty()
  @IsUrl()
  artwork: string

  @ApiProperty()
  artist: string

  @ApiProperty()
  @IsUrl()
  url: string

  @ApiProperty()
  @IsNumber()
  duration: number
}
