import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { UserResolver } from './users.resolver';
import { UserService } from './users.service';
import { UserCreatedListeners } from './listeners/user-created.listener';
import { HashModule } from '../hash/hash.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    HashModule,
  ],
  providers: [UserService, UserResolver, UserCreatedListeners],
  exports: [UserService, MongooseModule],
})
export class UserModule {}
