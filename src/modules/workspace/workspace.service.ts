import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Workspace } from "./entities/workspace.entity";
import { Model, Types } from "mongoose";

@Injectable()
export class WorkspaceService {
     constructor(
          @InjectModel(Workspace.name) private model: Model<Workspace>) { }

     async findById(id: string) {
          const workspace = await this.model.findById(id);
          return workspace;
     }

     async findWithPagination(input: any) {
          const { page, limit, workspaceId, ownerId, search, isActive, memberId } = input;
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
                    { 'meta': { $regex: search, $options: 'i' } },
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
          const workspaces = await this.model.find(filter).skip(skip).limit(limit).lean();

          return {
               items: workspaces,
               totalItems,
               totalPages,
               page,
               limit
          };
     }


}