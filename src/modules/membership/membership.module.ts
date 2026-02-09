import { Module } from "@nestjs/common";
import { MemberShipService } from "./membership.service";
import { MembershipResolver } from "./membership.resolver";
import { MongooseModule } from "@nestjs/mongoose";
import { Membership, MembershipSchema } from "./entities/membership.entity";
import { UserModule } from "../users/users.module";

@Module({
     imports: [MongooseModule.forFeature([{ name: Membership.name, schema: MembershipSchema }]), UserModule],
     providers: [MemberShipService, MembershipResolver],
     exports: [MemberShipService],
})
export class MembershipModule { }