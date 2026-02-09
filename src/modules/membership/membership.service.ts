import {
  Injectable,
  Logger,
  OnModuleInit,
} from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import { Membership } from "./entities/membership.entity"
import { FindMembership } from "./dto/find-membership-input.dto"
import { applyRange } from "src/common/helper/query/apply-range.helper"
import { DEFAULT_FREE_MEMBERSHIP } from "src/common/constants/membership.constant"
import {
  gqlBadRequestError,
  gqlNotFoundError,
} from "src/common/error/gql-error"

@Injectable()
export class MemberShipService implements OnModuleInit {
  private readonly logger = new Logger(MemberShipService.name)

  constructor(
    @InjectModel(Membership.name)
    private readonly model: Model<Membership>
  ) {}

  /* =======================
     MODULE INIT
  ======================= */
  async onModuleInit() {
    await this.ensureFreeMembershipExist()
  }

  async ensureFreeMembershipExist() {
    const existing = await this.model.findOne({ type: "FREE" })

    if (existing) {
      this.logger.log("FREE plan already exists")
      return
    }

    this.logger.log("FREE plan missing — creating now...")
    await this.model.create({ ...DEFAULT_FREE_MEMBERSHIP })
    this.logger.log("FREE plan created successfully")
  }

  /* =======================
     CREATE
  ======================= */
  async createMembership(input: Partial<Membership>) {
    if (!input.createdBy) {
      throw gqlBadRequestError("createdBy is required")
    }

    const createdBy = new Types.ObjectId(input.createdBy)

    const exists = await this.model.findOne({ type: input.type })
    if (exists) {
      throw gqlBadRequestError("Membership plan type already exists")
    }

    return this.model.create({
      ...input,
      createdBy,
    })
  }

  /* =======================
     UPDATE
  ======================= */
  async updateMembership(input: Partial<Membership>) {
    const id = input._id?.toString()
    if (!id) {
      throw gqlBadRequestError("Membership ID is required")
    }

    if (input.type) {
      const exists = await this.model.findOne({
        type: input.type,
        _id: { $ne: id },
      })

      if (exists) {
        throw gqlBadRequestError("Membership plan type already exists")
      }
    }

    const membership = await this.model
      .findByIdAndUpdate(id, input, { new: true })
      .populate({ path: "createdBy", model: "User" })

    if (!membership) {
      throw gqlNotFoundError("Membership plan not found")
    }

    return membership
  }

  /* =======================
     FIND (PAGINATED)
  ======================= */
  async findMembershipWithPagination(input: FindMembership) {
    const {
      page = 1,
      limit = 10,

      _id,
      type,
      price,
      trialPrice,
      durationDays,
      trialDurationDays,
      currency,
      projectsPerWorkspace,
      usersPerProject,
      isTrialAvailable,
      tags,
      isActive,
      isCancellable,
      createdBy,
    } = input

    const query: any = {}

    if (_id) query._id = _id
    if (type) query.type = type
    if (createdBy) query.createdBy = createdBy
    if (currency) query.currency = currency

    if (isTrialAvailable !== undefined)
      query.isTrialAvailable = isTrialAvailable

    if (isActive !== undefined)
      query.isActive = isActive

    if (isCancellable !== undefined)
      query.isCancellable = isCancellable

    if (tags?.length)
      query.tags = { $in: tags }

    applyRange(query, "price", price)
    applyRange(query, "trialPrice", trialPrice)
    applyRange(query, "durationDays", durationDays)
    applyRange(query, "trialDurationDays", trialDurationDays)
    applyRange(query, "maxProjectsPerWorkspace", projectsPerWorkspace)
    applyRange(query, "maxUsersPerProject", usersPerProject)

    const skip = (page - 1) * limit

    const [items, totalItems] = await Promise.all([
      this.model
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      this.model.countDocuments(query),
    ])

    const totalPages = Math.ceil(totalItems / limit)

    return {
      items,
      totalItems,
      totalPages,
      page,
      limit,
    }
  }

  /* =======================
     FIND HELPERS
  ======================= */
  async findById(id: string) {
    const plan = await this.model.findById(id)
    if (!plan) {
      throw gqlNotFoundError("Membership plan not found")
    }
    return plan
  }

  async findByType(type: string) {
    const plan = await this.model.findOne({ type })
    if (!plan) {
      throw gqlNotFoundError("Membership plan not found")
    }
    return plan
  }

  /* =======================
     DELETE
  ======================= */
  async deleteMembership(id: string) {
    const deleted = await this.model.findByIdAndDelete(id)
    if (!deleted) {
      throw gqlNotFoundError("Membership plan not found")
    }
    return deleted
  }

  /* =======================
     ACTIVE PLAN
  ======================= */
  async getActivePlanById(planId: string) {
    const plan = await this.model.findById(planId)

    if (!plan) {
      throw gqlNotFoundError("Membership plan not found")
    }

    if (!plan.isActive) {
      throw gqlBadRequestError("Plan is inactive and cannot be subscribed")
    }

    return plan
  }
}
