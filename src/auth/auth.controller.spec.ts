/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AccountType, Role, User } from 'src/user/entities/user.entity'
import { ConfigService } from '@nestjs/config'

describe('AuthController', () => {
  let controller: AuthController

  const userDataMock: User = {
    email: 'theblues@gmail.com',
    password: 'pawword',
    first_name: 'Thinh',
    last_name: 'Nguyen',
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

  const mockAuthService = {
    register: jest.fn(dto => {
      return userDataMock
    }),
    login: jest.fn(dto => {
      return {
        tokens: {
          access_token: 'access-token',
          refresh_token: 'refresh-token'
        },
        id: '1'
      }
    }),
    refreshToken: jest.fn(refreshToken => {
      return {
        access_token: 'access-token',
        refresh_token: 'refresh-token'
      }
    }),
    verifyAccount: jest.fn(token => {
      return {}
    }),
    forgotPassword: jest.fn(email => {
      return {}
    }),
    resetPassword: jest.fn(dto => {
      return {}
    })
  }

  const mockConfigService = {}

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        }
      ]
    }).compile()

    controller = app.get<AuthController>(AuthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should register user success', async () => {
    const dto = {
      first_name: 'test',
      last_name: 'test',
      email: 'test@gmail.com',
      password: '123456'
    }
    expect(await controller.register(dto)).toEqual({
      success: true,
      message: 'Register account success!!'
    })
  })

  it('should login user success', async () => {
    const dto = {
      email: 'test@gmail.com',
      password: '123456'
    }

    expect(await controller.login(dto)).toEqual({
      success: true,
      message: 'Login success',
      result: {
        tokens: {
          access_token: 'access-token',
          refresh_token: 'refresh-token'
        },
        id: '1'
      }
    })
  })

  it('should refresh token success', async () => {
    expect(await controller.refreshToken(userDataMock)).toEqual({
      success: true,
      result: {
        access_token: 'access-token',
        refresh_token: 'refresh-token'
      }
    })
  })

  // it('should verify success', async () => {
  //   expect(await controller.verifyAccount('objectid', 'token')).toEqual({
  //     success: true,
  //     message: 'Verify account success!!'
  //   })
  // })

  // it('should forgot password success', async () => {
  //   expect(await controller.forgotPassword({ email: 'test@gmail.com' })).toEqual({
  //     success: true,
  //     message: 'Check your email to reset password!!'
  //   })
  // })

  // it('should reset password success', async () => {
  //   expect(await controller.resetPassword({ password: 'test@gmail.com' }, 'token')).toEqual({
  //     success: true,
  //     message: 'Reset password success!!'
  //   })
  // })
})
