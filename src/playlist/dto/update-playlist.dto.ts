import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class UpdatePlaylistDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string
}
