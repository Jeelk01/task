// email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JwtService } from '../jwt/jwt.service';
import { TOKEN_TYPE } from 'src/common/enum/token-type.enum';
import { Device } from '../devices/entities/device.entity';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectQueue('email') private readonly queue: Queue
    , private readonly jwtService: JwtService
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('mail.host'),
      port: this.config.get<number>('mail.port'),
      secure: this.config.get<boolean>('mail.secure') ?? false,
      auth: {
        user: this.config.get<string>('mail.user'),
        pass: this.config.get<string>('mail.pass'),
      },
    });
  }

  async sendNow(options: nodemailer.SendMailOptions) {
    return this.transporter.sendMail({
      from: this.config.get<string>('mail.from'),
      ...options,
    });
  }

  async queueEmail(job: {
    to: string;
    subject: string;
    template: string;
    context: Record<string, any>;
  }) {
    await this.queue.add('send-email', job, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  async sendVerificationMail(payload: {
    userId: string;
    email: string;
    name: string;
    expiresIn: string;
  }) {
    this.logger.log(
      `Queueing verification email to ${payload.email}...`,
    );

    const verificationToken = this.jwtService.signVerificationToken({ userId: payload.userId, email: payload.email, type: TOKEN_TYPE.VERIFICATION_TOKEN })
    console.log("Email verification Token: ", verificationToken);

    await this.queueEmail({
      to: payload.email.toLowerCase(),
      subject: 'Verify your email',
      template: 'verify.mjml',
      context: {
        ...payload,
        verifyUrl: `https://yourapp.com/verify/${verificationToken}`,
      },
    });
  }

  async sendLoginAlertMail(payload: {
    userId: string,
    email: string,
    name: string,
    device: Device,
    token: string
  }) {
    await this.queueEmail({
      to: payload.email.toLocaleLowerCase(),
      subject: 'Login alert',
      template: 'login-alert.mjml',
      context: {
        ...payload,
        logoutUrl: `http://yourapp.com/security/logout/${payload.token}`
      }
    })
  }
}
