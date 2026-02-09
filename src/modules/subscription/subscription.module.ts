import { Module } from "@nestjs/common";
import { MembershipModule } from "../membership/membership.module";
import { MongooseModule } from "@nestjs/mongoose";
import { AccountSubscription } from "./entities/account-subscription.entity";
import { AccountSubscriptionSchema } from "./entities/account-subscription.entity";
import { SubscriptionResolver } from "./subscription.resolver";
import { SubscriptionService } from "./subscription.service";
import { UserModule } from "../users/users.module";
import { SubscriptionListener } from "./listener/subscription.listener";

@Module({
     imports: [
          MongooseModule.forFeature([
               { name: AccountSubscription.name, schema: AccountSubscriptionSchema }
          ]),
          UserModule,
          MembershipModule
     ],
     providers: [SubscriptionService, SubscriptionResolver, SubscriptionListener],
     exports: [SubscriptionService]
})
export class SubscriptionModule { }

