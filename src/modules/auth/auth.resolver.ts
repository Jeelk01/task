import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AuthResponse } from "./dto/auth-response";
import { LoginInput } from "./dto/login-input.dto";
import { AuthService } from "./auth.service";
import { CreateUserInput } from "./dto/create-user.dto";
import { UserResponse } from "../users/dto/user-response-dto";
import { RefreshTokenInput } from "./dto/refreshToken-input.dto";
import { BaseResponse } from "src/common/helper/response/base.response";
import { VerifyEmailInput } from "./dto/verify-mail-input";
import { EmailService } from "../email/email.service";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/common/guard/auth.guard";
import { CurrentUser } from "src/common/decorator/current-user.decorator";
import { User } from "../users/entities/user.entity";

@Resolver()
export class AuthResolver {
     constructor(private readonly authService: AuthService, private readonly emailService: EmailService) { }

     @Mutation(() => AuthResponse)
     async login(@Args('input') input: LoginInput) {

          const { accessToken, refreshToken, user } =
               await this.authService.login(input);

          console.log("AccessToken in Resolver: ", accessToken);
                    console.log("RefreshToken in Resolver: ", refreshToken);
                         console.log("User in Resolver: ", user);


          return {
               code: 200,
               success: true,
               message: "Login successful",
               accessToken,
               refreshToken,
               user
          };
     }

     @Mutation(() => UserResponse)
     async signup(@Args('input') input: CreateUserInput) {
          const user = await this.authService.signUp(input)

          return {
               code: 201,
               success: true,
               message: 'User signup successfully',
               user
          }
     }

     @Mutation(() => AuthResponse)
     async refreshToken(@Args('input') input: RefreshTokenInput) {
          const { accessToken, refreshToken, user } = await this.authService.refreshToken(input.refreshToken)

          return {
               code: 200,
               success: true,
               message: 'Token refreshed successfully',
               accessToken,
               refreshToken
          }
     }

     @Mutation(() => BaseResponse)
     async verifyEmail(@Args('input') input: VerifyEmailInput) {
          const user = await this.authService.verifyUserViaToken(input.token)

          return {
               code: 200,
               message: 'User verified successfully.',
               success: true,
          }
     }

     // User Id will be extracted from Token
     @UseGuards(AuthGuard)
     @Mutation(() => BaseResponse)
     async sendVerificationMail(@CurrentUser() user: User) {

          await this.emailService.sendVerificationMail({ userId: user._id.toString(), email: user.email, name: user.name, expiresIn: '3d' })

          return {
               code: 200,
               message: 'verification mail sent successfully.',
               success: true,
          }
     }
}

