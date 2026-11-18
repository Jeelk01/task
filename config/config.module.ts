import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import appConfig from './app.config'
import databaseConfig from './database.config'
import redisConfig from './redis.config'
import uploadConfig from './upload.config'
import mailConfig from './mail.config'
import graphqlConfig from './graphql.config'
import jwtConfig from './jwt.config'
import hashConfig from './hash.config'
import { validationSchema } from './validation'

@Module({
     imports: [
          ConfigModule.forRoot({
               isGlobal: true,
               load: [appConfig, databaseConfig, redisConfig, uploadConfig, graphqlConfig, mailConfig, jwtConfig, hashConfig],
               validationSchema
          })
     ]

})
export class AppConfigModule { }