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
    @InjectQueue('email') private readonly queue: Queue,
    private readonly jwtService: JwtService,
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
    const brevoApiKey = this.config.get<string>('mail.brevoApiKey');
    if (brevoApiKey) {
      return this.sendViaBrevo(brevoApiKey, options);
    }

    return this.transporter.sendMail({
      from: this.config.get<string>('mail.from'),
      ...options,
    });
  }

  // Brevo's HTTP API — used in production because Render's free tier blocks SMTP ports
  private async sendViaBrevo(
    apiKey: string,
    options: nodemailer.SendMailOptions,
  ) {
    const sender = this.parseAddress(
      (options.from as string) || this.config.get<string>('mail.from') || '',
    );
    const to = (Array.isArray(options.to) ? options.to : [options.to])
      .filter(Boolean)
      .map((addr) => this.parseAddress(String(addr)));

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender,
        to,
        subject: options.subject,
        htmlContent: options.html,
        textContent: options.text,
      }),
    });

    if (!res.ok) {
      throw new Error(`Brevo send failed (${res.status}): ${await res.text()}`);
    }
    return res.json();
  }

  // "Structo <me@gmail.com>" -> { name: 'Structo', email: 'me@gmail.com' }
  private parseAddress(value: string): { name?: string; email: string } {
    const cleaned = value.trim().replace(/^['"]|['"]$/g, '');
    const match = cleaned.match(/^(.*)<(.+)>$/);
    if (!match) return { email: cleaned };
    const name = match[1].trim().replace(/^['"]|['"]$/g, '');
    return name ? { name, email: match[2].trim() } : { email: match[2].trim() };
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
    this.logger.log(`Queueing verification email to ${payload.email}...`);

    const verificationToken = this.jwtService.signVerificationToken({
      userId: payload.userId,
      email: payload.email,
      type: TOKEN_TYPE.VERIFICATION_TOKEN,
    });

    const appUrl =
      this.config.get<string>('app.url') || 'http://172.31.192.1:8080';

    await this.queueEmail({
      to: payload.email.toLowerCase(),
      subject: 'Verify your email',
      template: 'verify.mjml',
      context: {
        ...payload,
        verifyUrl: `${appUrl}/verify?token=${verificationToken}`,
      },
    });
  }

  async sendLoginAlertMail(payload: {
    userId: string;
    email: string;
    name: string;
    device: Device;
    token: string;
  }) {
    const appUrl =
      this.config.get<string>('app.url') || 'http://172.31.192.1:8080';
    await this.queueEmail({
      to: payload.email.toLocaleLowerCase(),
      subject: 'Login alert',
      template: 'login-alert.mjml',
      context: {
        ...payload,
        logoutUrl: `${appUrl}/security/logout?token=${payload.token}`,
      },
    });
  }

  async sendWorkspaceInviteMail(payload: {
    email: string;
    workspaceName: string;
    invitedBy: string;
  }) {
    await this.queueEmail({
      to: payload.email.toLowerCase(),
      subject: 'Workspace Invitation',
      template: 'workspace-invite.mjml',
      context: payload,
    });
  }

  async sendProjectInviteMail(payload: {
    email: string;
    projectName: string;
    invitedBy: string;
  }) {
    await this.queueEmail({
      to: payload.email.toLowerCase(),
      subject: 'Project Invitation',
      template: 'project-invite.mjml',
      context: payload,
    });
  }

  async sendTaskAssignedMail(payload: {
    email: string;
    note: string;
    assignedBy: string;
  }) {
    await this.queueEmail({
      to: payload.email.toLowerCase(),
      subject: 'New Task Assigned',
      template: 'task-assigned.mjml',
      context: payload,
    });
  }
}
