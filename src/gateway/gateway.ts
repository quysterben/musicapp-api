import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({ cors: true })
export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  @WebSocketServer()
  server: Server

  handleEmitSocket({ data, event, to }) {
    if (to) {
      this.server.to(to).emit(event, data)
    } else {
      this.server.emit(event, data)
    }
  }

  afterInit() {}

  async handleConnection(socket: Socket) {
    const authHeader = socket.handshake.headers.authorization
    if (authHeader && (authHeader as string).split(' ')[1]) {
      try {
        const payload = await this.jwtService.verifyAsync((authHeader as string).split(' ')[1], {
          secret: this.configService.get<string>('JWT_SECRET_KEY')
        })
        socket.data.email = payload.email
        socket.join(socket.data.email)
        console.log('connect success', socket.data.email)
      } catch (e) {
        socket.disconnect()
      }
    } else {
      socket.disconnect()
    }
  }

  handleDisconnect(socket: Socket) {
    console.log('disconnected::client id', socket.id)
  }
}
