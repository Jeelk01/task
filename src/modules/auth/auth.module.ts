import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthResolver } from "./auth.resolver";
import { DeviceModule } from "../devices/device.module";
import { UserModule } from "../users/users.module";
import { JwtModule } from "../jwt/jwt.module";
import { SubscriptionModule } from "../subscription/subscription.module";
import { HashModule } from "../hash/hash.module";
import { MailModule } from "../email/email.module";

@Module({
     imports: [DeviceModule, UserModule, JwtModule, SubscriptionModule, HashModule, MailModule],
     providers: [AuthService, AuthResolver],
     exports: []
})
export class AuthModule { }