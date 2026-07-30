import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { Model, Types } from 'mongoose';
import { CreateWorkspaceInput } from './dto/create-workspace.dto';
import { WorkspaceRole } from 'src/common/enum/workspace-role.enum';
import { WorkspaceMemberStatus } from 'src/common/enum/workspace-member-status';
import { User } from 'src/modules/users/entities/user.entity';
import { UserService } from '../users/users.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/entities/notification.entity';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectModel(Workspace.name) private model: Model<Workspace>,
    @InjectModel(WorkspaceMember.name)
    private memberModel: Model<WorkspaceMember>,
    private userService: UserService,
    private notificationService: NotificationService,
  ) {}

  async findById(id: string) {
    const workspace = await this.model.findById(id);
    return workspace;
  }

  async findWorkspaceMemberWithPagination(input: any) {
    const { page, limit, workspaceId, userId, search, role, status } = input;
    const filter: any = {};

    if (workspaceId) filter.workspaceId = new Types.ObjectId(workspaceId);
    if (userId) filter.userId = new Types.ObjectId(userId);
    if (role) filter.role = role;
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const totalItems = await this.memberModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;
    const items = await this.memberModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      items,
      totalItems,
      totalPages,
      page,
      limit,
    };
  }

  async findWithPagination(input: any) {
    const { page, limit, workspaceId, ownerId, search, isActive, memberId } =
      input;
    const filter: any = {};

    if (workspaceId) {
      filter._id = new Types.ObjectId(workspaceId);
    }
    if (ownerId) {
      filter.ownerId = new Types.ObjectId(ownerId);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { meta: { $regex: search, $options: 'i' } },
      ];
    }
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    if (memberId) {
      filter.members = new Types.ObjectId(memberId);
    }

    const totalItems = await this.model.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;
    const workspaces = await this.model
      .find(filter)
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      items: workspaces as any,
      totalItems,
      totalPages,
      page,
      limit,
      code: 200,
      success: true,
      message: 'Workspaces fetched successfully',
    };
  }

  async createWorkspace(user: User, input: CreateWorkspaceInput) {
    const workspace = await this.model.create({
      ...input,
      ownerId: user._id,
      members: [user._id],
    });

    await this.memberModel.create({
      userId: user._id,
      email: user.email,
      invitedBy: user._id,
      status: WorkspaceMemberStatus.ACTIVE,
      role: WorkspaceRole.OWNER,
      workspaceId: workspace._id,
      acceptedAt: new Date(),
    });

    // Here a BullMQ job could be triggered to send workspace creation email notification

    return (workspace as any).toObject();
  }

  async updateWorkspace(
    workspaceId: string,
    user: User,
    updates: Partial<CreateWorkspaceInput>,
  ) {
    const workspace = await this.model.findById(workspaceId);
    if (!workspace) throw new Error('Workspace not found');

    const member = await this.memberModel.findOne({
      workspaceId,
      userId: user._id,
    });
    if (
      !member ||
      (member.role !== WorkspaceRole.OWNER &&
        member.role !== WorkspaceRole.ADMIN &&
        member.role !== WorkspaceRole.MANAGER)
    ) {
      throw new Error('You do not have permission to update this workspace');
    }

    Object.assign(workspace, updates);
    const saved = await workspace.save();
    return (saved as any).toObject();
  }

  async deleteWorkspace(workspaceId: string, user: User) {
    const workspace = await this.model.findById(workspaceId);
    if (!workspace) throw new Error('Workspace not found');

    const member = await this.memberModel.findOne({
      workspaceId,
      userId: user._id,
    });
    if (!member || member.role !== WorkspaceRole.OWNER) {
      throw new Error('Only the owner can delete the workspace');
    }

    await this.memberModel.deleteMany({ workspaceId });
    // Could clean up projects & tasks belonging to this workspace here
    await workspace.deleteOne();
    return workspace;
  }

  async addWorkspaceMember(
    workspaceId: string,
    email: string,
    role: WorkspaceRole,
    invitedBy: User,
  ) {
    const workspace = await this.model.findById(workspaceId);
    if (!workspace) throw new Error('Workspace not found');

    // Check permissions
    const inviterMember = await this.memberModel.findOne({
      workspaceId: new Types.ObjectId(workspaceId),
      userId: invitedBy._id,
    });
    if (
      !inviterMember ||
      (inviterMember.role !== WorkspaceRole.OWNER &&
        inviterMember.role !== WorkspaceRole.ADMIN)
    ) {
      throw new Error('Only owners and admins can invite members');
    }

    // Check if already a member
    const existing = await this.memberModel.findOne({
      workspaceId: new Types.ObjectId(workspaceId),
      email,
    });
    if (existing)
      throw new Error('User is already a member or invited to this workspace');

    // Find user by email
    const userToInvite = await this.userService.findByEmail(email);

    const member = (await this.memberModel.create({
      workspaceId: new Types.ObjectId(workspaceId),
      email,
      role,
      invitedBy: invitedBy._id,
      userId: userToInvite ? userToInvite._id : null,
      status: WorkspaceMemberStatus.INVITED,
      acceptedAt: undefined,
    })) as any;

    if (userToInvite) {
      // Create Notification
      await this.notificationService.createNotification(
        userToInvite._id.toString(),
        NotificationType.INVITE_WORKSPACE,
        {
          workspaceId,
          invitationId: member._id.toString(),
          workspaceName: workspace.name,
          senderName: invitedBy.name,
          message: `You've been invited to join the workspace "${workspace.name}"`,
        },
      );
    }

    return member;
  }

  async removeWorkspaceMember(
    workspaceId: string,
    memberId: string,
    removedBy: User,
  ) {
    const workspace = await this.model.findById(workspaceId);
    if (!workspace) throw new Error('Workspace not found');

    // Check permissions
    const requesterMember = await this.memberModel.findOne({
      workspaceId: new Types.ObjectId(workspaceId),
      userId: removedBy._id,
    });
    if (
      !requesterMember ||
      (requesterMember.role !== WorkspaceRole.OWNER &&
        requesterMember.role !== WorkspaceRole.ADMIN)
    ) {
      throw new Error('Only owners and admins can remove members');
    }

    const targetMember = await this.memberModel.findById(memberId);
    if (!targetMember) throw new Error('Member not found');

    if (targetMember.workspaceId.toString() !== workspaceId) {
      throw new Error('Member does not belong to this workspace');
    }

    // Prevent removing the owner
    if (targetMember.role === WorkspaceRole.OWNER)
      throw new Error('Owner cannot be removed');

    await targetMember.deleteOne();
    if (targetMember.userId) {
      await this.model.findByIdAndUpdate(workspaceId, {
        $pull: { members: targetMember.userId },
      });
    }

    return true;
  }

  async findWorkspaces(args: any) {
    const { page, limit, tags, search, isActive } = args;
    const query: any = {};

    if (tags && tags.length > 0) query.tags = { $in: tags };
    if (isActive !== undefined) query.isActive = isActive;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const totalCount = await this.model.countDocuments(query);
    const nodes = await this.model
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      items: nodes,
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      page,
      limit,
      code: 200,
      success: true,
      message: 'Data retrieved successfully',
    };
  }

  async findMyInvitations(user: User) {
    // Find invitations by email or userId
    const invitations = await this.memberModel
      .find({
        $or: [{ email: user.email }, { userId: user._id }],
        status: WorkspaceMemberStatus.INVITED,
      })
      .lean();

    return invitations;
  }

  async acceptInvitation(invitationId: string, user: User) {
    const member = await this.memberModel.findById(invitationId);
    if (!member) throw new Error('Invitation not found');

    // Safety check: ensure the invitation belongs to the user
    if (
      member.email !== user.email &&
      member.userId?.toString() !== user._id.toString()
    ) {
      throw new Error('This invitation does not belong to you');
    }

    member.status = WorkspaceMemberStatus.ACTIVE;
    member.userId = user._id;
    member.acceptedAt = new Date();
    await member.save();

    // Add user to workspace members array
    await this.model.findByIdAndUpdate(member.workspaceId, {
      $addToSet: { members: user._id },
    });

    return member;
  }

  async rejectInvitation(invitationId: string, user: User) {
    const member = await this.memberModel.findById(invitationId);
    if (!member) throw new Error('Invitation not found');

    if (
      member.email !== user.email &&
      member.userId?.toString() !== user._id.toString()
    ) {
      throw new Error('This invitation does not belong to you');
    }

    member.status = WorkspaceMemberStatus.REJECTED;
    await member.save();
    return true;
  }

  async findMyWorkspaces(args: any, user: User) {
    const { page, limit, tags, search, isActive } = args;

    // Get all my workspace memberships that are ACTIVE
    const myMemberships = await this.memberModel
      .find({
        userId: user._id,
        status: WorkspaceMemberStatus.ACTIVE,
      })
      .select('workspaceId');
    const myWorkspaceIds = myMemberships.map((m) => m.workspaceId);

    const query: any = {
      _id: { $in: myWorkspaceIds },
    };

    if (tags && tags.length > 0) query.tags = { $in: tags };
    if (isActive !== undefined) query.isActive = isActive;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const totalCount = await this.model.countDocuments(query);
    const nodes = await this.model
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      items: nodes,
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      page,
      limit,
      code: 200,
      success: true,
      message: 'Data retrieved successfully',
    };
  }

  async updateWorkspaceMemberRole(
    workspaceId: string,
    memberId: string,
    newRole: WorkspaceRole,
    requester: User,
  ) {
    const workspace = await this.model.findById(workspaceId);
    if (!workspace) throw new Error('Workspace not found');

    const requesterMember = await this.memberModel.findOne({
      workspaceId: new Types.ObjectId(workspaceId),
      userId: requester._id,
    });

    if (
      !requesterMember ||
      (requesterMember.role !== WorkspaceRole.OWNER &&
        requesterMember.role !== WorkspaceRole.ADMIN)
    ) {
      throw new Error('Only workspace owners and admins can modify roles');
    }

    const targetMember = await this.memberModel.findById(memberId);

    if (!targetMember) throw new Error('Member not found');

    if (targetMember.workspaceId.toString() !== workspaceId) {
      throw new Error('Member does not belong to this workspace');
    }

    if (targetMember.role === WorkspaceRole.OWNER) {
      throw new Error('Workspace owner role cannot be changed');
    }

    if (
      newRole === WorkspaceRole.OWNER &&
      requesterMember.role !== WorkspaceRole.OWNER
    ) {
      throw new Error('Only the workspace owner can transfer ownership');
    }

    targetMember.role = newRole;
    return await targetMember.save();
  }

  async getMemberRole(workspaceId: string, userId: string) {
    const member = await this.memberModel.findOne({
      workspaceId: new Types.ObjectId(workspaceId),
      userId: new Types.ObjectId(userId),
      status: WorkspaceMemberStatus.ACTIVE,
    });
    return member?.role || null;
  }
}
