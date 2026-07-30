import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Meeting, MeetingSchema } from './entities/meeting.entity';
import { MeetingService } from './meeting.service';
import { MeetingResolver } from './meeting.resolver';
import { MeetingGateway } from './meeting.gateway';
import { JwtModule } from '../jwt/jwt.module';
import { WorkspaceModule } from '../workspace/workspace.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Meeting.name, schema: MeetingSchema }]),
    JwtModule,
    WorkspaceModule,
  ],
  providers: [MeetingService, MeetingResolver, MeetingGateway],
  exports: [MeetingService],
})
export class MeetingModule {}
