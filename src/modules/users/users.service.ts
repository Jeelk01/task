import {
     Injectable,
     Logger,
     OnModuleInit,
} from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { User } from "./entities/user.entity"
import { Model, Types } from "mongoose"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { CreateUserInput } from "../auth/dto/create-user.dto"
import { FindUsersWithPaginationInput } from "./dto/find-user-pagination-input.dto"
import { UpdateUserInput } from "./dto/update-user.dto"
import { HashService } from "../hash/hash.service"
import { SYSTEM_USER } from "src/common/constants/system.constant"
import {
     gqlBadRequestError,
     gqlNotFoundError,
} from "src/common/error/gql-error"

@Injectable()
export class UserService implements OnModuleInit {
     private readonly logger = new Logger(UserService.name)

     constructor(
          @InjectModel(User.name) private model: Model<User>,
          private eventEmitter: EventEmitter2,
          private readonly hashService: HashService
     ) { }

     /* =======================
        MODULE INIT
     ======================= */
     async onModuleInit() {
          await this.ensureSystemUserExist()
     }

     async ensureSystemUserExist() {
          const existing = await this.model.findOne({
               _id: new Types.ObjectId(SYSTEM_USER.ID),
          })

          if (existing) {
               this.logger.log("👤 System User already exists")
               return
          }

          const hashed = await this.hashService.hashPassword(
               SYSTEM_USER.PASSWORD
          )

          this.logger.log("👤 System User missing — creating now")

          await this.model.create({
               _id: new Types.ObjectId(SYSTEM_USER.ID),
               name: SYSTEM_USER.NAME,
               email: SYSTEM_USER.EMAIL,
               password: hashed,
               isActive: true,
               isVerified: true,
               role: SYSTEM_USER.ROLE,
               createdBy: null,
          })

          this.logger.log("👤 System User created")
     }

     /* =======================
        FINDERS
     ======================= */
     async findById(userId: string) {
          const user = await this.model.findById(userId)
          if (!user) {
               throw gqlNotFoundError("User not found")
          }
          return user
     }

     async findActiveUsersAmongList(userIds: string[]) {
          return this.model
               .find({
                    _id: { $in: userIds },
                    isActive: true,
               })
               .lean()
     }

     async findByEmail(email: string) {
          return this.model.findOne({ email }).lean()
     }

     async findByEmailWithPassword(email: string) {
          return this.model
               .findOne({ email })
               .select("+password")
               .lean()
     }

     /* =======================
        CREATE
     ======================= */
     async create(input: Partial<User>) {
          if (!input.name || !input.email || !input.password) {
               throw gqlBadRequestError("Missing required fields")
          }

          const email = input.email.trim().toLowerCase()

          const existingUser = await this.findByEmail(email)
          if (existingUser) {
               throw gqlBadRequestError("Email already exists")
          }

          const hashedPassword = await this.hashService.hashPassword(
               input.password
          )

          const user = await this.model.create({
               ...input,
               email,
               password: hashedPassword,
          })

          this.eventEmitter.emit("user.created", {
               userId: user._id,
               email: user.email,
               name: user.name,
          })

          return user
     }

     /* =======================
        PAGINATED FIND
     ======================= */
     async findUsersWithPagination(
          input: FindUsersWithPaginationInput
     ) {
          const {
               page = 1,
               limit = 10,
               search,
               name,
               email,
               isActive,
               isVerified,
               role,
          } = input

          const query: any = {}

          if (search) {
               query.$or = [
                    { name: new RegExp(search, "i") },
                    { email: new RegExp(search, "i") },
               ]
          }

          if (name) query.name = new RegExp(name, "i")
          if (email) query.email = new RegExp(email, "i")
          if (role) query.role = new RegExp(role, "i")
          if (isActive !== undefined) query.isActive = isActive
          if (isVerified !== undefined) query.isVerified = isVerified

          const totalItems = await this.model.countDocuments(query)

          const items = await this.model
               .find(query)
               .sort({ createdAt: -1 })
               .skip((page - 1) * limit)
               .limit(limit)
               .lean()

          return {
               items,
               totalItems,
               totalPages: Math.ceil(totalItems / limit),
               page,
               limit,
          }
     }

     /* =======================
        UPDATE
     ======================= */
     async updateUser(input: UpdateUserInput) {
          const { _id, ...rest } = input

          const updated = await this.model.findByIdAndUpdate(
               _id,
               { $set: rest },
               { new: true, runValidators: true }
          )

          if (!updated) {
               throw gqlNotFoundError("User not found")
          }

          return updated
     }

     /* =======================
        VERIFY USER
     ======================= */
     async verifyUser(userId: string, email: string) {
          const user = await this.model.findOneAndUpdate(
               {
                    _id: new Types.ObjectId(userId),
                    email,
                    isActive: true,
               },
               {
                    isVerified: true,
                    verifiedAt: new Date(),
               },
               { new: true }
          )

          if (!user) {
               throw gqlNotFoundError("User not found")
          }

          return user
     }
}
