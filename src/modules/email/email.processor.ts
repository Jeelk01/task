// email.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailService } from './email.service';
import { Logger } from '@nestjs/common';
import * as path from 'path';
import { compilePartialTemplate } from './helpers/template.helper';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly email: EmailService) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    switch (job.name) {
      case 'send-email':
        await this.sendEmail(job);
        break;

      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  private async sendEmail(job: Job<any>) {
    const { to, subject, template, context } = job.data;

    try {
      const templatesRoot = path.join(
        process.cwd(),
        'src/modules/email/templates',
      );

      const layoutPath = path.join(templatesRoot, 'main.mjml');
      const bodyPath = path.join(templatesRoot, template);

      this.logger.debug(`Layout path: ${layoutPath}`);
      this.logger.debug(`Body path: ${bodyPath}`);

      const html = compilePartialTemplate(bodyPath, layoutPath, context);

      await this.email.sendNow({ to, subject, html });

      this.logger.log(`📨 Email successfully sent → ${to}`);
    } catch (err) {
      this.logger.error(`❌ Failed sending email → ${to}`);
      this.logger.error(err);
      throw err;
    }
  }
}
