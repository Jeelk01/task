import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import {
     AccountSubscription,
} from "./entities/account-subscription.entity"
import { CreateSubscriptionInput } from "./dto/create-subscription.dto"
import { MemberShipService } from "../membership/membership.service"
import { SubscriptionStatus } from "src/common/enum/subscription-status.enum"
import { UserService } from "../users/users.service"
import {
     gqlBadRequestError,
     gqlNotFoundError,
} from "src/common/error/gql-error"

@Injectable()
export class SubscriptionService {
     constructor(
          @InjectModel(AccountSubscription.name)
          private readonly subModel: Model<AccountSubscription>,
          private readonly userService: UserService,
          private readonly planService: MemberShipService
     ) { }

     /* =======================
        INTERNAL CREATE
     ======================= */
     async create(input: Partial<AccountSubscription>) {
          return this.subModel.create(input)
     }

     /* =======================
        CREATE SUBSCRIPTION
     ======================= */
     async createSubscription(input: CreateSubscriptionInput) {
          const userId = new Types.ObjectId(input.userId)

          const plan = await this.planService.getActivePlanById(input.planId)

          const existing = await this.subModel.findOne({
               userId,
               status: {
                    $in: [
                         SubscriptionStatus.TRIALING,
                         SubscriptionStatus.ACTIVE,
                    ],
               },
          })

          if (existing) {
               throw gqlBadRequestError(
                    "User already has an active subscription"
               )
          }

          const startDate = new Date()
          let endDate: Date | null = new Date()

          if (plan.durationDays === -1) {
               endDate = null
          } else {
               endDate.setDate(endDate.getDate() + plan.durationDays)
          }

          return this.create({
               userId,
               planId: plan._id,
               startDate,
               endDate,
               priceAtPurchase: plan.price,
               currency: plan.currency,
               maxWorkspaces: plan.maxWorkspaces,
               maxDevices: plan.maxDevices,
               maxProjectsPerWorkspace: plan.maxProjectsPerWorkspace,
               maxUsersPerProject: plan.maxUsersPerProject,
               status: SubscriptionStatus.ACTIVE,
          })
     }

     /* =======================
        DEFAULT PLAN (SINGLE)
     ======================= */
     async createDefaultSubscriptionPlan(userId: string) {
          const plan = await this.planService.findByType("FREE")
          if (!plan) {
               throw gqlNotFoundError("Default plan not found")
          }

          const user = await this.userService.findById(userId)
          if (!user || !user.isActive) {
               throw gqlNotFoundError("User not found")
          }

          return this.create({
               userId: new Types.ObjectId(user._id),
               planId: plan._id,
               startDate: new Date(),
               endDate: null,
               priceAtPurchase: plan.price,
               currency: plan.currency,
               maxWorkspaces: plan.maxWorkspaces,
               maxDevices: plan.maxDevices,
               maxProjectsPerWorkspace: plan.maxProjectsPerWorkspace,
               maxUsersPerProject: plan.maxUsersPerProject,
               status: SubscriptionStatus.ACTIVE,
          })
     }

     /* =======================
        DEFAULT PLAN (BULK)
     ======================= */
     async createDefaultSubscriptionsForUsers(userIds: string[]) {
          const plan = await this.planService.findByType("FREE")
          if (!plan) {
               throw gqlNotFoundError("Default plan not found")
          }

          const users =
               await this.userService.findActiveUsersAmongList(userIds)

          const validUserIds = users.map((u) => u._id.toString())

          if (!validUserIds.length) {
               return {
                    created: [],
                    skipped: userIds,
                    failed: [],
               }
          }

          const ids = validUserIds.map(
               (id) => new Types.ObjectId(id)
          )

          const existingSubs = await this.subModel
               .find(
                    {
                         userId: { $in: ids },
                         status: {
                              $in: [
                                   SubscriptionStatus.TRIALING,
                                   SubscriptionStatus.ACTIVE,
                              ],
                         },
                    },
                    { userId: 1 }
               )
               .lean()

          const alreadySubscribed = new Set(
               existingSubs.map((s) => s.userId.toString())
          )

          const toCreate = validUserIds.filter(
               (id) => !alreadySubscribed.has(id)
          )

          const docs = toCreate.map((id) => ({
               userId: new Types.ObjectId(id),
               planId: plan._id,
               startDate: new Date(),
               endDate: null,
               priceAtPurchase: plan.price,
               currency: plan.currency,
               maxWorkspaces: plan.maxWorkspaces,
               maxDevices: plan.maxDevices,
               maxProjectsPerWorkspace: plan.maxProjectsPerWorkspace,
               maxUsersPerProject: plan.maxUsersPerProject,
               status: SubscriptionStatus.ACTIVE,
          }))

          let created: AccountSubscription[] = []
          let failed: string[] = []

          if (docs.length) {
               try {
                    created = await this.subModel.insertMany(docs, {
                         ordered: false,
                    })
               } catch {
                    failed = docs.map((d) => d.userId.toString())
               }
          }

          return {
               created,
               skipped: Array.from(alreadySubscribed),
               failed,
          }
     }

     /* =======================
        FINDERS
     ======================= */
     async findSubscriptionByUserId(userId: string) {
          return this.subModel
               .find({ userId: new Types.ObjectId(userId) })
               .sort({ createdAt: -1 })
               .lean()
     }

     async getActiveSubscription(userId: string) {
          return this.subModel.findOne({
               userId: new Types.ObjectId(userId),
               status: {
                    $in: [
                         SubscriptionStatus.TRIALING,
                         SubscriptionStatus.ACTIVE,
                    ],
               },
          })
     }

     /* =======================
        CANCEL
     ======================= */
     async cancelSubscription(id: string) {
          const updated = await this.subModel.findByIdAndUpdate(
               id,
               { status: SubscriptionStatus.CANCELLED },
               { new: true }
          )

          if (!updated) {
               throw gqlNotFoundError("Subscription not found")
          }

          return updated
     }

     /* =======================
        FIND ALL
     ======================= */
     async findAll() {
          return this.subModel.find().lean()
     }
}
