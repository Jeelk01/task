import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attachment } from './entity/attachment.entity';
import { CreateAttachmentInput } from './dto/create-attachment.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { WorkspaceMember } from 'src/modules/workspace/entities/workspace-member.entity';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectModel(Attachment.name) private attachmentModel: Model<Attachment>,
    @InjectModel(WorkspaceMember.name)
    private workspaceMemberModel: Model<WorkspaceMember>,
    private readonly uploadService: UploadService,
  ) {}

  async uploadAttachment(user: User, input: any, file?: any) {
    // Add auth rules if needed, e.g. checking workspace membership
    const workspaceMember = await this.workspaceMemberModel.findOne({
      workspaceId: input.workspaceId,
      userId: user._id,
    });

    if (!workspaceMember) {
      throw new Error('You do not have access to this workspace.');
    }

    let filepath = input.filepath;
    let fileName = input.fileName;
    let type = input.type;
    const size = input.size;

    if (file) {
      const saved = await this.uploadService.saveFile(file);
      filepath = saved.url;
      fileName = saved.filename;
      type = saved.mimetype;
      // path is saved.path if needed
    }

    const attachment = await this.attachmentModel.create({
      ...input,
      filepath,
      fileName,
      type,
      size,
      uploadedBy: user._id,
    });

    return attachment;
  }

  async deleteAttachment(attachmentId: string, user: User) {
    const attachment = await this.attachmentModel.findById(attachmentId);
    if (!attachment) throw new Error('Attachment not found');

    // Could verify if they uploaded it, or if they are admin
    if (attachment.uploadedBy.toString() !== user._id.toString()) {
      throw new Error('Only the uploader can delete this attachment.');
    }

    return await attachment.deleteOne();
  }
}
