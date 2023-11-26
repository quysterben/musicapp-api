import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { AccountType, Role, User } from 'src/user/entities/user.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'

describe('AuthService', () => {
  let service: AuthService

  const mockUserData = {
    email: 'test@gmail.com',
    password: '123456',
    first_name: 'test',
    last_name: 'test',
    refresh_token: null,
    avatar: null,
    id: 1,
    role: Role.Admin,
    account_type: AccountType.Local,
    created_at: undefined,
    updated_at: undefined,
    songs: [],
    notifications: [],
    favoriteSongs: [],
    playlists: []
  }

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn()
  }

  const mockConfigService = {
    get: jest.fn()
  }

  const mockUserRepo = {
    findOneBy: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
    update: jest.fn()
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        }
      ]
    }).compile()

    service = app.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('register', () => {
    it('should register user success', async () => {
      const dto = {
        first_name: 'test',
        last_name: 'test',
        email: 'test@gmail.com',
        password: '123456'
      }

      jest.spyOn(mockUserRepo, 'findOneBy').mockResolvedValue(null)

      jest.spyOn(service, 'hashPassword').mockResolvedValue('123456')

      jest.spyOn(mockUserRepo, 'save').mockReturnValue(mockUserData)

      expect(await service.register(dto)).toMatchObject(mockUserData)
    })

    it('should register user fail', async () => {
      const dto = {
        first_name: 'test',
        last_name: 'test',
        email: 'test@gmail.com',
        password: '123456'
      }

      jest.spyOn(mockUserRepo, 'findOneBy').mockResolvedValue(mockUserData)

      jest.spyOn(service, 'hashPassword').mockResolvedValue('123456')

      jest.spyOn(mockUserRepo, 'save').mockReturnValue(mockUserData)

      await expect(service.register(dto)).rejects.toThrow('Email already have an account')
    })
  })

  describe('login', () => {
    it('should login success', async () => {
      jest.spyOn(mockUserRepo, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnValue({
          addSelect: jest.fn().mockReturnValue({
            getOne: jest.fn().mockResolvedValue({
              ...mockUserData
            })
          })
        })
      })

      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true)

      jest.spyOn(service, 'generateToken').mockResolvedValue({
        access_token: 'access_token',
        refresh_token: 'refresh_token'
      })

      expect(
        await service.login({
          email: mockUserData.email,
          password: mockUserData.password
        })
      ).toMatchObject({
        tokens: {
          access_token: 'access_token',
          refresh_token: 'refresh_token'
        },
        id: mockUserData.id
      })
    })

    it('should login fail - email not exist', async () => {
      jest.spyOn(mockUserRepo, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnValue({
          addSelect: jest.fn().mockReturnValue({
            getOne: jest.fn().mockResolvedValue(null)
          })
        })
      })

      await expect(
        service.login({
          email: mockUserData.email,
          password: mockUserData.password
        })
      ).rejects.toThrow('Email is not exist')
    })

    it('should login fail - password not correct', async () => {
      jest.spyOn(mockUserRepo, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnValue({
          addSelect: jest.fn().mockReturnValue({
            getOne: jest.fn().mockResolvedValue({
              ...mockUserData
            })
          })
        })
      })

      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false)

      jest.spyOn(service, 'generateToken').mockResolvedValue({
        access_token: 'access_token',
        refresh_token: 'refresh_token'
      })

      await expect(
        service.login({
          email: mockUserData.email,
          password: mockUserData.password
        })
      ).rejects.toThrow('Is password is not correct')
    })
  })

  it('should refresh token success', async () => {
    jest.spyOn(service, 'generateToken').mockResolvedValue({
      access_token: 'access_token',
      refresh_token: 'refresh_token'
    })
  })

  it('should generateToken success', async () => {
    jest.spyOn(mockConfigService, 'get').mockReturnValue('secret')
    jest.spyOn(mockJwtService, 'signAsync').mockResolvedValueOnce('access_token')
    jest.spyOn(mockJwtService, 'signAsync').mockResolvedValueOnce('refresh_token')

    jest.spyOn(mockUserRepo, 'update').mockResolvedValueOnce(true)

    expect(
      await service.generateToken({
        id: mockUserData.id,
        email: mockUserData.email
      })
    ).toMatchObject({
      access_token: 'access_token',
      refresh_token: 'refresh_token'
    })
  })

  it('should handleVerifyToken success', async () => {
    jest.spyOn(mockConfigService, 'get').mockReturnValue('secret')
    jest.spyOn(mockJwtService, 'verifyAsync').mockResolvedValueOnce({
      id: mockUserData.id,
      email: mockUserData.email
    })

    expect(await service.handleVerifyToken('token')).toBe(mockUserData.email)
  })
})
