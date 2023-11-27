import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreatePlaylistDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string
}
