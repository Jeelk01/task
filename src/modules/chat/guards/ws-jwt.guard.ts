import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '../../jwt/jwt.service';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const authToken =
        client.handshake.auth?.token || client.handshake.headers?.authorization;

      if (!authToken) {
        throw new WsException('Unauthorized: No token provided');
      }

      const token = authToken.split(' ')[1];
      const payload = this.jwtService.verifyAccessToken(token);

      // Attach user payload to client for further use
      client.data.userId = payload.userId;
      return true;
    } catch (err) {
      throw new WsException('Unauthorized: Invalid token');
    }
  }
}
