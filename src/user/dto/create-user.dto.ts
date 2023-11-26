import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, MinLength } from 'class-validator'

export class CreateUserDto {
  @ApiProperty()
  first_name: string

  @ApiProperty()
  last_name: string

  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @MinLength(6)
  password: string
}
