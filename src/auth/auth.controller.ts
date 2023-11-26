import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { RegisterDto } from './dto/register.dto'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { ApiTags } from '@nestjs/swagger'
import { User } from 'src/user/entities/user.entity'
import { GetUserRequest, Public } from './decorators'
import { GoogleAuthGuard } from './guards/google.guard'
import { ConfigService } from '@nestjs/config'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {}

  @Public(true)
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      await this.authService.register(registerDto)
      return {
        success: true,
        message: 'Register account success!!'
      }
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  @Public(true)
  @UsePipes(ValidationPipe)
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<any> {
    const data = await this.authService.login(loginDto)
    return {
      success: true,
      message: 'Login success',
      result: data
    }
  }

  @Post('refresh-token')
  async refreshToken(@GetUserRequest() user: User): Promise<any> {
    return {
      success: true,
      result: await this.authService.refreshToken(user)
    }
  }

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  @Public(true)
  googleLogin() {
    return {
      message: 'authenticated'
    }
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  @Header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
  @Public(true)
  async googleLoginRedirect(@GetUserRequest() user: User) {
    const tokens = await this.authService.generateToken({ id: user.id, email: user.email })
    const htmlWithEmbeddedJWT = `
    <html>
      <script>
        // Redirect browser to root of application
        window.location.href = '${this.configService.get('FE_URL')}/oauth/redirect?access_token=${
          tokens.access_token
        }&refresh_token=${tokens.refresh_token}';
      </script>
    </html>
    `
    return htmlWithEmbeddedJWT
  }
}
