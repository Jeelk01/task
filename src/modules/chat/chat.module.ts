import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatResolver } from './chat.resolver';
import { ChatMessage, ChatMessageSchema } from './entities/chat-message.entity';
import { JwtModule } from '../jwt/jwt.module';
import { WorkspaceModule } from '../workspace/workspace.module';
import { UserModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatMessage.name, schema: ChatMessageSchema },
    ]),
    JwtModule,
    WorkspaceModule,
    UserModule,
  ],
  providers: [ChatService, ChatGateway, ChatResolver],
  exports: [ChatService],
})
export class ChatModule {}
