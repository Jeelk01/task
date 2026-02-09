import { Injectable } from "@nestjs/common"
import { UserService } from "../users/users.service"
import { DeviceService } from "../devices/device.service"
import { JwtService, LogOutDevicePayload } from "../jwt/jwt.service"
import { LoginInput } from "./dto/login-input.dto"
import { SubscriptionService } from "../subscription/subscription.service"
import { HashService } from "../hash/hash.service"
import { CreateUserInput } from "./dto/create-user.dto"
import { TOKEN_TYPE } from "src/common/enum/token-type.enum"
import { EventEmitter2 } from "@nestjs/event-emitter"
import {
     gqlAuthError,
     gqlNotFoundError,
     gqlBadRequestError,
} from "src/common/error/gql-error"

@Injectable()
export class AuthService {
     constructor(
          private readonly userService: UserService,
          private readonly deviceService: DeviceService,
          private readonly jwtService: JwtService,
          private readonly subscriptionService: SubscriptionService,
          private readonly hashService: HashService,
          private readonly eventEmitter: EventEmitter2
     ) { }

     /* =======================
        LOGIN
     ======================= */
     async login(input: LoginInput) {
          const { email, password, deviceId, deviceName, userAgent, ip } = input

          const user = await this.userService.findByEmailWithPassword(email)
          if (!user || !user.isActive) {
               throw gqlNotFoundError("User not found")
          }

          const isValidPassword = await this.hashService.comparePassword(
               password,
               user.password
          )

          if (!isValidPassword) {
               throw gqlAuthError("Invalid credentials")
          }

          const subscription =
               await this.subscriptionService.getActiveSubscription(user._id.toString())

          if (!subscription) {
               throw gqlNotFoundError("User subscription plan not found")
          }

          const activeDevices =
               await this.deviceService.findActiveDevices(user._id.toString())

          const isSameDeviceAlreadyLoggedIn = activeDevices.some(
               (d) => d.deviceId === deviceId
          )

          if (
               activeDevices.length >= subscription.maxDevices &&
               !isSameDeviceAlreadyLoggedIn
          ) {
               throw gqlBadRequestError("Maximum device limit reached")
          }

          const jti = this.jwtService.generateJti()

          const accessToken = this.jwtService.signAccessToken({
               type: TOKEN_TYPE.ACCESS_TOKEN,
               userId: user._id.toString(),
               deviceId,
               jti,
          })

          const refreshToken = this.jwtService.signRefreshToken({
               type: TOKEN_TYPE.REFRESH_TOKEN,
               userId: user._id.toString(),
               deviceId,
               jti,
          })

          const refreshTokenHash =
               await this.hashService.hashPassword(refreshToken)

          const device = await this.deviceService.upsertDeviceSession({
               userId: user._id.toString(),
               deviceId,
               deviceName,
               userAgent,
               ip,
               refreshTokenHash,
               jti,
               expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          })

          const logoutTokenPayload: LogOutDevicePayload = {
               userId: user._id.toString(),
               type: TOKEN_TYPE.LOGOUT_TOKEN,
               deviceId,
               jti,
          }

          const logoutToken =
               this.jwtService.signLogoutDeviceToken(logoutTokenPayload)

          this.eventEmitter.emit("user.login", {
               userId: user._id,
               email: user.email,
               name: user.name,
               device,
               token: logoutToken,
          })

          return { accessToken, refreshToken, user }
     }

     async signUp(input: CreateUserInput) {
          return this.userService.create(input)
     }

     async refreshToken(refreshToken: string) {
          let tokenPayload: any

          try {
               tokenPayload = this.jwtService.verifyRefreshToken(refreshToken)
          } catch {
               throw gqlAuthError("Invalid or expired refresh token")
          }

          const { userId, deviceId, jti } = tokenPayload

          const user = await this.userService.findById(userId)
          if (!user || !user.isActive) {
               throw gqlNotFoundError("User not found")
          }

          const device = await this.deviceService.findByDeviceId(deviceId)
          if (!device) {
               throw gqlAuthError("Device not found")
          }

          const isMatched = await this.hashService.compareString(
               refreshToken,
               device.refreshTokenHash
          )

          if (!isMatched) {
               throw gqlAuthError("Invalid refresh token")
          }

          if (device.isRevoked) {
               throw gqlAuthError('Device is revoked')
          }

          if (device.isBlocked) {
               throw gqlAuthError("Device blocked")
          }

          if (device.jti !== jti) {
               throw gqlAuthError("Invalid token")
          }

          const newAccessToken = this.jwtService.signAccessToken({
               userId,
               deviceId,
               jti,
               type: TOKEN_TYPE.ACCESS_TOKEN,
          })

          return { accessToken: newAccessToken, refreshToken, user }
     }

     async verifyUserViaToken(verificationToken: string) {
          const payload =
               this.jwtService.verifyVerificationToken(verificationToken)

          const { userId, email } = payload
          return this.userService.verifyUser(userId, email)
     }
}
