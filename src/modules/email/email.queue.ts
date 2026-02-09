import { BullModule } from '@nestjs/bullmq'

export const EmailQueueModule = BullModule.registerQueue({
     name: 'email'
})