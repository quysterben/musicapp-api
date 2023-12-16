import { Controller, Get } from '@nestjs/common'
import { Public } from './auth/decorators'

@Controller()
export class AppController {
  @Get()
  @Public(true)
  getHello() {
    return {
      message: 'Welcome to the Music App API! access to endpoint /api for more apis info. tks!!!'
    }
  }
}
