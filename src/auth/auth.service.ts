import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { RegisterDto } from './dto/register.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/user/entities/user.entity'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { LoginDto } from './dto/login.dto'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtSercive: JwtService,
    private configService: ConfigService
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const user = await this.userRepo.findOneBy({ email: registerDto.email })

    if (user) {
      throw new BadRequestException('Email already have an account')
    }

    const hashPassword = await this.hashPassword(registerDto.password)

    return await this.userRepo.save({
      ...registerDto,
      password: hashPassword
    })
  }

  async login(loginDto: LoginDto): Promise<any> {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .where('user.email = :email', { email: loginDto.email })
      .addSelect('user.password')
      .getOne()

    if (!user) {
      throw new UnauthorizedException('Email is not exist')
    }

    const checkPass = bcrypt.compareSync(loginDto.password, user.password)
    if (!checkPass) {
      throw new UnauthorizedException('Is password is not correct')
    }

    // generate access token and refresh token
    const payload = { id: user.id, email: user.email }

    const tokens = await this.generateToken(payload)

    return { tokens, id: user.id }
  }

  async refreshToken(user: User): Promise<any> {
    return this.generateToken({ id: user.id, email: user.email })
  }

  public async generateToken(payload: { id: number; email: string }) {
    const access_token = await this.jwtSercive.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXP_IN')
    })
    const refresh_token = await this.jwtSercive.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXP_IN')
    })
    await this.userRepo.update({ email: payload.email }, { refresh_token: refresh_token })

    return { access_token, refresh_token }
  }

  public async handleVerifyToken(token: string) {
    try {
      const payload = await this.jwtSercive.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET_KEY')
      })
      return payload['email']
    } catch (e) {
      throw new UnauthorizedException('unauthorized')
    }
  }

  public async hashPassword(password: string): Promise<string> {
    const saltRound = 10
    const salt = await bcrypt.genSalt(saltRound)
    const hash = await bcrypt.hash(password, salt)

    return hash
  }
}
