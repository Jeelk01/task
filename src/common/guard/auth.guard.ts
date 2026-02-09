import {
     CanActivate,
     ExecutionContext,
     Injectable,
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import { DeviceService } from 'src/modules/devices/device.service'
import { JwtService } from 'src/modules/jwt/jwt.service'
import { UserService } from 'src/modules/users/users.service'
import { gqlAuthError, gqlNotFoundError } from '../error/gql-error'

@Injectable()
export class AuthGuard implements CanActivate {
     constructor(
          private readonly userService: UserService,
          private readonly deviceService: DeviceService,
          private readonly jwtService: JwtService,
     ) { }

     async canActivate(context: ExecutionContext): Promise<boolean> {
          const ctx = GqlExecutionContext.create(context)
          const req = ctx.getContext().req

          const auth = req.headers?.authorization
          if (!auth) {
               throw gqlAuthError('Missing auth header')
          }

          const [type, token] = auth.split(' ')
          if (type !== 'Bearer' || !token) {
               throw gqlAuthError('Invalid token format')
          }

          let payload: any
          try {
               payload = this.jwtService.verifyAccessToken(token)
          } catch {
               throw gqlAuthError('Invalid or expired token')
          }

          if (!payload?.userId || !payload?.deviceId || !payload?.jti) {
               throw gqlAuthError('Malformed token payload')
          }

          const user = await this.userService.findById(payload.userId)
          if (!user) {
               throw gqlNotFoundError('User not found')
          }

          if (!user.isActive) {
               throw gqlAuthError('Account disabled')
          }

          const device = await this.deviceService.findByDeviceId(payload.deviceId)
          if (!device) {
               throw gqlNotFoundError('Device login not found')
          }

          if (device.jti !== payload.jti) {
               throw gqlAuthError('Token is not valid for this device')
          }

          if (device.isBlocked) {
               throw gqlAuthError('Device is blocked')
          }

          if (device.isRevoked) {
               throw gqlAuthError('Device is revoked')
          }

          // attach context
          req.user = user
          req.device = device
          req.token = payload

          return true
     }
}
