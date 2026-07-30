import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task } from './entity/task.entity';
import { Project } from 'src/modules/project/entities/project.entity';
import { ProjectMember } from 'src/modules/project/entities/project-member.entity';
import { WorkspaceMember } from 'src/modules/workspace/entities/workspace-member.entity';
import { CreateTaskInput, UpdateTaskInput } from './dto/create-task.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { ProjectRole } from 'src/common/enum/project-role.enum';
import { WorkspaceRole } from 'src/common/enum/workspace-role.enum';
import { EmailService } from 'src/modules/email/email.service';
import { NotificationPreferenceService } from 'src/modules/notification-preference/notification-preference.service';
import { UserService } from '../users/users.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(ProjectMember.name)
    private projectMemberModel: Model<ProjectMember>,
    @InjectModel(WorkspaceMember.name)
    private workspaceMemberModel: Model<WorkspaceMember>,
    private readonly emailService: EmailService,
    private readonly notificationPrefService: NotificationPreferenceService,
    private readonly userService: UserService,
  ) {}

  async createTask(user: User, input: CreateTaskInput) {
    // Check if user is a project member or workspace admin
    const pId = new Types.ObjectId(input.projectId);
    const wsId = new Types.ObjectId(input.workspaceId);
    const uId = user._id;

    const projectMember = await this.projectMemberModel.findOne({
      projectId: pId,
      userId: new Types.ObjectId(uId as any),
    });

    if (!projectMember) {
      const workspaceMember = await this.workspaceMemberModel.findOne({
        workspaceId: wsId,
        userId: new Types.ObjectId(uId as any),
      });
      if (
        !workspaceMember ||
        (workspaceMember.role !== WorkspaceRole.OWNER &&
          workspaceMember.role !== WorkspaceRole.ADMIN)
      ) {
        throw new Error(
          'You must be a project member or workspace administrator to create a task.',
        );
      }
    } else if (projectMember.role === ProjectRole.VIEWER) {
      throw new Error('Viewers cannot create tasks.');
    }

    const task = (await this.taskModel.create({
      ...input,
      workspaceId: new Types.ObjectId(input.workspaceId),
      projectId: new Types.ObjectId(input.projectId),
      assignedTo: input.assignedTo
        ? input.assignedTo.map((id) => new Types.ObjectId(id))
        : [],
      attachments: input.attachments
        ? input.attachments.map((id) => new Types.ObjectId(id))
        : [],
      blockerId: input.blockerId
        ? new Types.ObjectId(input.blockerId)
        : undefined,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      assignedBy: user._id,
    } as any)) as unknown as Task;

    if (input.assignedTo && input.assignedTo.length > 0) {
      const assignees = await this.workspaceMemberModel.find({
        userId: { $in: input.assignedTo.map((id) => new Types.ObjectId(id)) },
        workspaceId: new Types.ObjectId(input.workspaceId),
      });

      for (const assigneeId of input.assignedTo) {
        try {
          const prefEnabled = await this.notificationPrefService.checkPref(
            assigneeId,
            'taskAssign',
          );
          if (prefEnabled) {
            const assigneeUser = await this.userService.findById(assigneeId);
            if (assigneeUser && assigneeUser['email']) {
              await this.emailService.sendTaskAssignedMail({
                email: assigneeUser['email'],
                note: task.note,
                assignedBy: user.name,
              });
            }
          }
        } catch (e) {
          console.error('Error sending task assignment email:', e);
        }
      }
    }

    return task;
  }

  async updateTask(user: User, input: UpdateTaskInput) {
    const task = await this.taskModel.findById(input.id);
    if (!task) throw new Error('Task not found');

    // Check if user is assigned, or project admin, or workspace admin
    const isAssignee = task.assignedTo.some(
      (id) => id.toString() === user._id.toString(),
    );
    const isCreator = task.assignedBy.toString() === user._id.toString();

    if (!isAssignee && !isCreator) {
      const projectMember = await this.projectMemberModel.findOne({
        projectId: task.projectId,
        userId: user._id,
      });
      if (
        !projectMember ||
        (projectMember.role !== ProjectRole.ADMIN &&
          projectMember.role !== ProjectRole.OWNER &&
          projectMember.role !== ProjectRole.MANAGER)
      ) {
        const workspaceMember = await this.workspaceMemberModel.findOne({
          workspaceId: task.workspaceId,
          userId: user._id,
        });
        if (
          !workspaceMember ||
          (workspaceMember.role !== WorkspaceRole.ADMIN &&
            workspaceMember.role !== WorkspaceRole.OWNER)
        ) {
          throw new Error('You do not have permission to update this task.');
        }
      }
    }

    // Handle Blocker Change & Circular Check
    if (input.blockerId) {
      const blockerId = new Types.ObjectId(input.blockerId);
      if (blockerId.toString() === task._id.toString()) {
        throw new Error('A task cannot block itself.');
      }

      // Simple one-level circular check: Does the blocker depend on this task?
      const blocker = await this.taskModel.findById(blockerId);
      if (
        blocker &&
        blocker.blockerId &&
        blocker.blockerId.toString() === task._id.toString()
      ) {
        throw new Error(
          'Circular dependency detected: The selected blocker is already blocked by this task.',
        );
      }
      task.blockerId = blockerId;
    } else if (input.blockerId === null) {
      task.blockerId = undefined;
    }

    if (input.dueDate) {
      task.dueDate = new Date(input.dueDate);
    }

    if (input.status) {
      const oldStatus = task.status;
      task.status = input.status;

      // Auto-set completedAt when transitioning to COMPLETED (or whatever the enum value is)
      // Using 'completed' string to match enum value in task-status.enum.ts
      if (
        input.status.toLowerCase() === 'completed' &&
        oldStatus.toLowerCase() !== 'completed'
      ) {
        task.completedAt = new Date();
      } else if (input.status.toLowerCase() !== 'completed') {
        task.completedAt = undefined;
      }
    }

    // Apply other fields safely
    if (input.note) task.note = input.note;
    if (input.priority) task.priority = input.priority;
    if (input.assignedTo)
      task.assignedTo = input.assignedTo.map((id) => new Types.ObjectId(id));
    if (input.tags) task.tags = input.tags;

    return await task.save();
  }

  async deleteTask(taskId: string, user: User) {
    const task = await this.taskModel.findById(taskId);
    if (!task) throw new Error('Task not found');

    const isCreator = task.assignedBy.toString() === user._id.toString();
    if (!isCreator) {
      const projectMember = await this.projectMemberModel.findOne({
        projectId: task.projectId,
        userId: user._id,
      });
      if (
        !projectMember ||
        (projectMember.role !== ProjectRole.ADMIN &&
          projectMember.role !== ProjectRole.OWNER &&
          projectMember.role !== ProjectRole.MANAGER)
      ) {
        // Check workspace role
        const workspaceMember = await this.workspaceMemberModel.findOne({
          workspaceId: task.workspaceId,
          userId: user._id,
        });
        if (
          !workspaceMember ||
          (workspaceMember.role !== WorkspaceRole.OWNER &&
            workspaceMember.role !== WorkspaceRole.ADMIN)
        ) {
          throw new Error(
            'Only task creator, project managers, or admins can delete the task.',
          );
        }
      }
    }

    return await task.deleteOne();
  }

  async findTasks(args: any, user: User) {
    const {
      page,
      limit,
      workspaceId,
      projectId,
      status,
      priority,
      assignedTo,
      assignedBy,
      tags,
      search,
    } = args;

    const query: any = {};

    if (projectId) {
      const pId = new Types.ObjectId(projectId);
      const projectDoc = await this.projectModel.findById(pId);
      if (!projectDoc) throw new Error('Project not found');

      // Check access: Project Member or Workspace Admin/Owner
      const projectMember = await this.projectMemberModel.findOne({
        projectId: pId,
        userId: user._id,
      });

      if (!projectMember) {
        const workspaceMember = await this.workspaceMemberModel.findOne({
          workspaceId: projectDoc.workspaceId,
          userId: user._id,
          role: { $in: [WorkspaceRole.OWNER, WorkspaceRole.ADMIN] },
        });

        if (!workspaceMember) {
          throw new Error(
            'Access denied: You do not have permission to view tasks in this project.',
          );
        }
      }
      query.projectId = pId;
    } else if (workspaceId) {
      const wsId = new Types.ObjectId(workspaceId);
      const workspaceMember = await this.workspaceMemberModel.findOne({
        workspaceId: wsId,
        userId: user._id,
      });

      if (!workspaceMember) {
        throw new Error(
          'Access denied: You are not a member of this workspace.',
        );
      }

      if (
        workspaceMember.role === WorkspaceRole.OWNER ||
        workspaceMember.role === WorkspaceRole.ADMIN
      ) {
        query.workspaceId = wsId;
      } else {
        // Limited to projects where user is member within this workspace
        const myProjectMemberships = await this.projectMemberModel.find({
          userId: user._id,
        });
        const myProjectIds = myProjectMemberships.map((m) => m.projectId);

        const projectInWs = await this.projectModel.find({
          _id: { $in: myProjectIds },
          workspaceId: wsId,
        });
        const allowedProjectIds = projectInWs.map((p) => p._id);

        query.projectId = { $in: allowedProjectIds };
      }
    } else {
      // Global (Dashboard) - show tasks in projects user is member of OR workspaces user is Admin/Owner
      const myProjectMemberships = await this.projectMemberModel.find({
        userId: user._id,
      });
      const myProjectIds = myProjectMemberships.map((m) => m.projectId);

      const myAdminWorkspaces = await this.workspaceMemberModel.find({
        userId: user._id,
        role: { $in: [WorkspaceRole.OWNER, WorkspaceRole.ADMIN] },
      });
      const myAdminWsIds = myAdminWorkspaces.map((w) => w.workspaceId);

      query.$or = [
        { projectId: { $in: myProjectIds } },
        { workspaceId: { $in: myAdminWsIds } },
      ];
    }

    if (status && status.length > 0) query.status = { $in: status };
    if (priority && priority.length > 0) query.priority = { $in: priority };
    if (assignedTo && assignedTo.length > 0)
      query.assignedTo = {
        $in: assignedTo.map((id) => new Types.ObjectId(id)),
      };
    if (assignedBy && assignedBy.length > 0)
      query.assignedBy = {
        $in: assignedBy.map((id) => new Types.ObjectId(id)),
      };
    if (tags && tags.length > 0) query.tags = { $in: tags };

    if (search) {
      query.note = { $regex: search, $options: 'i' };
    }

    const totalItems = await this.taskModel.countDocuments(query);
    const items = await this.taskModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      page,
      limit,
      code: 200,
      success: true,
      message: 'Tasks retrieved successfully',
    };
  }

  async findMyTasks(args: any, user: User) {
    const {
      page,
      limit,
      workspaceId,
      projectId,
      status,
      priority,
      tags,
      search,
    } = args;
    // Base rule for MyTasks: I must be assigned to the task
    const query: any = {
      assignedTo: user._id,
    };

    if (workspaceId) query.workspaceId = new Types.ObjectId(workspaceId);
    if (projectId) query.projectId = new Types.ObjectId(projectId);

    if (status && status.length > 0) query.status = { $in: status };
    if (priority && priority.length > 0) query.priority = { $in: priority };
    if (tags && tags.length > 0) query.tags = { $in: tags };

    if (search) {
      query.note = { $regex: search, $options: 'i' };
    }

    const totalItems = await this.taskModel.countDocuments(query);
    const items = await this.taskModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      page,
      limit,
      code: 200,
      success: true,
      message: 'My tasks retrieved successfully',
    };
  }

  async findById(id: string, user: User) {
    const task = await this.taskModel.findById(id);
    if (!task) return null;

    // Access Check (same logic as findTasks)
    const projectMember = await this.projectMemberModel.findOne({
      projectId: task.projectId,
      userId: user._id,
    });

    if (!projectMember) {
      const workspaceMember = await this.workspaceMemberModel.findOne({
        workspaceId: task.workspaceId,
        userId: user._id,
      });

      if (
        !workspaceMember ||
        (workspaceMember.role !== WorkspaceRole.OWNER &&
          workspaceMember.role !== WorkspaceRole.ADMIN)
      ) {
        throw new Error(
          'Access denied: You are not authorized to view this task.',
        );
      }
    }

    return task;
  }
}
