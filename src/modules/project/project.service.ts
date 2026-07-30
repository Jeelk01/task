import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';
import { WorkspaceMember } from 'src/modules/workspace/entities/workspace-member.entity';
import { Model, Types } from 'mongoose';
import { CreateProjectInput } from './dto/create-project.dto';
import { ProjectRole } from 'src/common/enum/project-role.enum';
import { ProjectMemberStatus } from 'src/common/enum/project-member-status';
import { WorkspaceRole } from 'src/common/enum/workspace-role.enum';
import { User } from 'src/modules/users/entities/user.entity';
import { UserService } from '../users/users.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/entities/notification.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(ProjectMember.name)
    private projectMemberModel: Model<ProjectMember>,
    @InjectModel(WorkspaceMember.name)
    private workspaceMemberModel: Model<WorkspaceMember>,
    private userService: UserService,
    private notificationService: NotificationService,
  ) {}

  async findById(id: string, user?: User) {
    const project = await this.projectModel.findById(id);
    if (!project) return null;

    if (user) {
      // Check if user is a member of the project
      const isProjectMember = await this.projectMemberModel.findOne({
        projectId: project._id,
        userId: user._id,
      });

      if (!isProjectMember) {
        // Check if user is a workspace owner/admin
        const workspaceMember = await this.workspaceMemberModel.findOne({
          workspaceId: project.workspaceId,
          userId: user._id,
        });

        if (
          !workspaceMember ||
          (workspaceMember.role !== WorkspaceRole.OWNER &&
            workspaceMember.role !== WorkspaceRole.ADMIN &&
            workspaceMember.role !== WorkspaceRole.MANAGER)
        ) {
          throw new Error(
            'Access denied: You do not have permission to access this project.',
          );
        }
      }
    }

    return project;
  }

  async findProjectMemberWithPagination(input: any) {
    const { page, limit, projectId, userId, search, role, status } = input;
    const filter: any = {};

    if (projectId) filter.projectId = new Types.ObjectId(projectId);
    if (userId) filter.userId = new Types.ObjectId(userId);
    if (role) filter.role = role;
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const totalItems = await this.projectMemberModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;
    const items = await this.projectMemberModel
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

  async createProject(user: User, input: CreateProjectInput) {
    // Verify user has permission in workspace
    const wsId = new Types.ObjectId(input.workspaceId);
    const uId = user._id;

    console.log(`Checking permission for user ${uId} in workspace ${wsId}`);

    const workspaceMember = await this.workspaceMemberModel.findOne({
      workspaceId: wsId,
      userId: new Types.ObjectId(uId as any),
    });

    if (!workspaceMember) {
      console.error(
        `No WorkspaceMember found for user ${uId} in workspace ${wsId}`,
      );
      throw new Error('You are not a member of this workspace');
    }

    console.log(`User role in workspace: ${workspaceMember.role}`);

    if (
      workspaceMember.role !== WorkspaceRole.OWNER &&
      workspaceMember.role !== WorkspaceRole.ADMIN &&
      workspaceMember.role !== WorkspaceRole.MANAGER
    ) {
      throw new Error(
        'You do not have permission to create a project in this workspace',
      );
    }

    const project = await this.projectModel.create({
      ...input,
      creatorId: user._id,
      members: [user._id],
    });

    await this.projectMemberModel.create({
      userId: user._id,
      email: user.email,
      invitedBy: user._id,
      status: ProjectMemberStatus.ACTIVE,
      role: ProjectRole.OWNER,
      projectId: project._id,
    });

    return project;
  }

  async updateProject(
    projectId: string,
    user: User,
    updates: Partial<CreateProjectInput>,
  ) {
    const project = await this.projectModel.findById(projectId);
    if (!project) throw new Error('Project not found');

    const member = await this.projectMemberModel.findOne({
      projectId: new Types.ObjectId(projectId),
      userId: new Types.ObjectId(user._id as any),
    });
    if (
      !member ||
      (member.role !== ProjectRole.OWNER &&
        member.role !== ProjectRole.ADMIN &&
        member.role !== ProjectRole.MANAGER)
    ) {
      // Check if they are workspace admin/manager
      const wsMember = await this.workspaceMemberModel.findOne({
        workspaceId: project.workspaceId,
        userId: user._id,
      });
      if (
        !wsMember ||
        (wsMember.role !== WorkspaceRole.OWNER &&
          wsMember.role !== WorkspaceRole.ADMIN &&
          wsMember.role !== WorkspaceRole.MANAGER)
      ) {
        throw new Error('You do not have permission to update this project');
      }
    }

    Object.assign(project, updates);
    return await project.save();
  }

  async deleteProject(projectId: string, user: User) {
    const project = await this.projectModel.findById(projectId);
    if (!project) throw new Error('Project not found');

    const member = await this.projectMemberModel.findOne({
      projectId: new Types.ObjectId(projectId),
      userId: new Types.ObjectId(user._id as any),
    });

    if (!member || member.role !== ProjectRole.OWNER) {
      // Check if they are workspace owner
      const workspaceMember = await this.workspaceMemberModel.findOne({
        workspaceId: new Types.ObjectId(project.workspaceId as any),
        userId: new Types.ObjectId(user._id as any),
      });
      if (!workspaceMember || workspaceMember.role !== WorkspaceRole.OWNER) {
        throw new Error(
          'Only project or workspace owners can delete this project',
        );
      }
    }

    await this.projectMemberModel.deleteMany({
      projectId: new Types.ObjectId(projectId),
    });
    return await project.deleteOne();
  }

  async addProjectMember(
    projectId: string,
    email: string,
    role: ProjectRole,
    invitedBy: User,
  ) {
    const project = await this.projectModel.findById(projectId);
    if (!project) throw new Error('Project not found');

    // Check permissions
    const inviterMember = await this.projectMemberModel.findOne({
      projectId: new Types.ObjectId(projectId),
      userId: invitedBy._id,
    });

    let canInvite =
      inviterMember &&
      (inviterMember.role === ProjectRole.OWNER ||
        inviterMember.role === ProjectRole.ADMIN);

    if (!canInvite) {
      // Check if they are workspace owner/admin
      const workspaceMember = await this.workspaceMemberModel.findOne({
        workspaceId: project.workspaceId,
        userId: invitedBy._id,
      });
      if (
        workspaceMember &&
        (workspaceMember.role === WorkspaceRole.OWNER ||
          workspaceMember.role === WorkspaceRole.ADMIN)
      ) {
        canInvite = true;
      }
    }

    if (!canInvite) {
      throw new Error(
        'Only project/workspace owners and admins can invite members',
      );
    }

    // Check if already a member
    const existing = await this.projectMemberModel.findOne({
      projectId: new Types.ObjectId(projectId),
      email,
    });
    if (existing)
      throw new Error('User is already a member or invited to this project');

    // Find user by email
    const userToInvite = await this.userService.findByEmail(email);

    const member = (await this.projectMemberModel.create({
      projectId: new Types.ObjectId(projectId),
      userId: userToInvite ? userToInvite._id : null,
      email,
      role,
      invitedBy: invitedBy._id,
      status: ProjectMemberStatus.INVITED, // Always start as invited
    })) as any;

    if (userToInvite) {
      await this.notificationService.createNotification(
        userToInvite._id.toString(),
        NotificationType.INVITE_PROJECT,
        {
          projectId,
          projectName: project.name,
          senderName: invitedBy.name,
          message: `You've been invited to join the project "${project.name}"`,
        },
      );
    }

    return member;
  }

  async acceptProjectInvitation(projectId: string, user: User) {
    const member = await this.projectMemberModel.findOne({
      projectId: new Types.ObjectId(projectId),
      $or: [{ userId: user._id }, { email: user.email }],
      status: ProjectMemberStatus.INVITED,
    });

    if (!member) throw new Error('Invitation not found');

    member.status = ProjectMemberStatus.ACTIVE;
    member.userId = user._id;
    await member.save();

    await this.projectModel.findByIdAndUpdate(projectId, {
      $addToSet: { members: user._id },
    });

    return member;
  }

  async rejectProjectInvitation(projectId: string, user: User) {
    const member = await this.projectMemberModel.findOne({
      projectId: new Types.ObjectId(projectId),
      $or: [{ userId: user._id }, { email: user.email }],
      status: ProjectMemberStatus.INVITED,
    });

    if (!member) throw new Error('Invitation not found');

    member.status = ProjectMemberStatus.REJECTED;
    await member.save();
    return true;
  }

  async removeProjectMember(
    projectId: string,
    memberId: string,
    removedBy: User,
  ) {
    const project = await this.projectModel.findById(projectId);
    if (!project) throw new Error('Project not found');

    // Check permissions
    const requesterMember = await this.projectMemberModel.findOne({
      projectId: new Types.ObjectId(projectId),
      userId: removedBy._id,
    });

    let canRemove =
      requesterMember &&
      (requesterMember.role === ProjectRole.OWNER ||
        requesterMember.role === ProjectRole.ADMIN);

    if (!canRemove) {
      // Check if they are workspace owner/admin
      const workspaceMember = await this.workspaceMemberModel.findOne({
        workspaceId: project.workspaceId,
        userId: removedBy._id,
      });
      if (
        workspaceMember &&
        (workspaceMember.role === WorkspaceRole.OWNER ||
          workspaceMember.role === WorkspaceRole.ADMIN)
      ) {
        canRemove = true;
      }
    }

    if (!canRemove) {
      throw new Error(
        'Only project/workspace owners and admins can remove members',
      );
    }

    const targetMember = await this.projectMemberModel.findById(memberId);
    if (!targetMember) throw new Error('Member not found');

    if (targetMember.projectId.toString() !== projectId) {
      throw new Error('Member does not belong to this project');
    }

    // Prevent removing the owner
    if (targetMember.role === ProjectRole.OWNER)
      throw new Error('Owner cannot be removed');

    await targetMember.deleteOne();
    if (targetMember.userId) {
      await this.projectModel.findByIdAndUpdate(projectId, {
        $pull: { members: targetMember.userId },
      });
    }

    return true;
  }

  async updateProjectMemberRole(
    projectId: string,
    memberId: string,
    newRole: ProjectRole,
    requester: User,
  ) {
    const project = await this.projectModel.findById(projectId);
    if (!project) throw new Error('Project not found');

    // Check if requester is Owner or Admin of the project
    const requesterMember = await this.projectMemberModel.findOne({
      projectId: new Types.ObjectId(projectId),
      userId: requester._id,
    });

    let canModify =
      requesterMember &&
      (requesterMember.role === ProjectRole.OWNER ||
        requesterMember.role === ProjectRole.ADMIN);
    let isWorkspaceOwner = false;

    if (!canModify || newRole === ProjectRole.OWNER) {
      // Check if they are workspace owner/admin
      const workspaceMember = await this.workspaceMemberModel.findOne({
        workspaceId: project.workspaceId,
        userId: requester._id,
      });
      if (workspaceMember) {
        if (
          workspaceMember.role === WorkspaceRole.OWNER ||
          workspaceMember.role === WorkspaceRole.ADMIN
        ) {
          canModify = true;
        }
        if (workspaceMember.role === WorkspaceRole.OWNER) {
          isWorkspaceOwner = true;
        }
      }
    }

    if (!canModify) {
      throw new Error(
        'Only project/workspace owners and admins can modify roles',
      );
    }

    const targetMember = await this.projectMemberModel.findById(memberId);

    if (!targetMember) throw new Error('Member not found');

    if (targetMember.projectId.toString() !== projectId) {
      throw new Error('Member does not belong to this project');
    }

    // Prevent changing the role of the Owner
    if (targetMember.role === ProjectRole.OWNER) {
      throw new Error('Project owner role cannot be changed');
    }

    // Prevent non-owners from promoting others to OWNER
    if (
      newRole === ProjectRole.OWNER &&
      requesterMember?.role !== ProjectRole.OWNER &&
      !isWorkspaceOwner
    ) {
      throw new Error(
        'Only the project owner or workspace owner can transfer ownership',
      );
    }

    targetMember.role = newRole;
    return await targetMember.save();
  }

  async findProjects(args: any) {
    const { page, limit, workspaceId, tags, search } = args;
    const query: any = {};

    if (workspaceId) query.workspaceId = new Types.ObjectId(workspaceId);
    if (tags && tags.length > 0) query.tags = { $in: tags };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const totalCount = await this.projectModel.countDocuments(query);
    const nodes = await this.projectModel
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

  async findMyProjects(args: any, user: User) {
    const { page, limit, workspaceId, tags, search } = args;

    // I must be a member of the project
    const myMemberships = await this.projectMemberModel
      .find({ userId: user._id })
      .select('projectId');
    const myProjectIds = myMemberships.map((m) => m.projectId);

    const query: any = {
      _id: { $in: myProjectIds },
    };

    if (workspaceId) query.workspaceId = new Types.ObjectId(workspaceId);
    if (tags && tags.length > 0) query.tags = { $in: tags };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const totalCount = await this.projectModel.countDocuments(query);
    const nodes = await this.projectModel
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

  async getMemberRole(
    projectId: string,
    userId: string,
  ): Promise<string | null> {
    const member = await this.projectMemberModel.findOne({
      projectId: new Types.ObjectId(projectId),
      userId: new Types.ObjectId(userId),
    });
    return member?.role || null;
  }
}
