import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { TOKEN_TYPE } from 'src/common/enum/token-type.enum';
import { gqlAuthError, gqlBadRequestError } from 'src/common/error/gql-error';

export interface BaseTokenPayload {
  userId: string;
  type: TOKEN_TYPE;
}

export interface JwtPayload extends BaseTokenPayload {
  deviceId: string;
  jti: string;
}

export interface DeviceTokenPayload extends BaseTokenPayload {
  type: TOKEN_TYPE.DEVICE_TOKEN;
}

export interface VerificationPayload extends BaseTokenPayload {
  email: string;
  type: TOKEN_TYPE.VERIFICATION_TOKEN;
}

export interface LogOutDevicePayload extends BaseTokenPayload {
  type: TOKEN_TYPE.LOGOUT_TOKEN;
  deviceId: string;
  jti: string;
}

@Injectable()
export class JwtService {
  constructor(private readonly config: ConfigService) {}

  generateJti() {
    return randomUUID();
  }

  /* =======================
        ACCESS TOKEN
     ======================= */
  signAccessToken(payload: JwtPayload): string {
    const secret = this.config.get<string>('jwt.secret');
    const expiresIn = this.config.get<string>('jwt.expiresIn');

    if (!secret || !expiresIn) {
      throw gqlBadRequestError('JWT access token config missing');
    }

    return jwt.sign(payload, secret, {
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      const payload = jwt.verify(
        token,
        this.config.get<string>('jwt.secret') as string,
      ) as JwtPayload;

      if (payload.type !== TOKEN_TYPE.ACCESS_TOKEN) {
        throw gqlAuthError('Invalid token type');
      }

      return payload;
    } catch {
      throw gqlAuthError('Invalid or expired access token');
    }
  }

  /* =======================
        REFRESH TOKEN
     ======================= */
  signRefreshToken(payload: JwtPayload): string {
    const secret = this.config.get<string>('refreshJwt.secret');
    const expiresIn = this.config.get<string>('refreshJwt.expiresIn');

    if (!secret || !expiresIn) {
      throw gqlBadRequestError('Refresh token config missing');
    }

    return jwt.sign(payload, secret, {
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      const payload = jwt.verify(
        token,
        this.config.get<string>('refreshJwt.secret') as string,
      ) as JwtPayload;

      if (payload.type !== TOKEN_TYPE.REFRESH_TOKEN) {
        throw gqlAuthError('Invalid token type');
      }

      return payload;
    } catch {
      throw gqlAuthError('Invalid or expired refresh token');
    }
  }

  /* =======================
        DEVICE TOKEN
     ======================= */
  signDeviceToken(payload: DeviceTokenPayload): string {
    const secret = this.config.get<string>('secondaryToken.secret');
    const expiresIn = this.config.get<string>('secondaryToken.expiresIn');

    if (!secret || !expiresIn) {
      throw gqlBadRequestError('Secondary token config missing');
    }

    return jwt.sign(payload, secret, {
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  verifyDeviceToken(token: string): DeviceTokenPayload {
    const secret = this.config.get<string>('secondaryToken.secret');
    if (!secret) {
      throw gqlBadRequestError('Missing secondary token secret');
    }

    try {
      const payload = jwt.verify(token, secret) as DeviceTokenPayload;

      if (payload.type !== TOKEN_TYPE.DEVICE_TOKEN) {
        throw gqlAuthError('Invalid token type');
      }

      return payload;
    } catch {
      throw gqlAuthError('Invalid or expired device token');
    }
  }

  /* =======================
        VERIFICATION TOKEN
     ======================= */
  signVerificationToken(payload: VerificationPayload) {
    const secret = this.config.get<string>('secondaryToken.secret');
    const expiresIn = this.config.get<string>('secondaryToken.expiresIn');

    if (!secret || !expiresIn) {
      throw gqlBadRequestError('Verification token config missing');
    }

    return jwt.sign(payload, secret, {
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  verifyVerificationToken(token: string) {
    const secret = this.config.get<string>('secondaryToken.secret');
    if (!secret) {
      throw gqlBadRequestError('Missing verification token secret');
    }

    try {
      const payload = jwt.verify(token, secret) as VerificationPayload;

      if (payload.type !== TOKEN_TYPE.VERIFICATION_TOKEN) {
        throw gqlAuthError('Invalid token type');
      }

      return payload;
    } catch {
      throw gqlAuthError('Invalid or expired verification token');
    }
  }

  /* =======================
        LOGOUT DEVICE TOKEN
     ======================= */
  signLogoutDeviceToken(payload: LogOutDevicePayload) {
    const secret = this.config.get<string>('secondaryToken.secret');
    const expiresIn = this.config.get<string>('secondaryToken.expiresIn');

    if (!secret || !expiresIn) {
      throw gqlBadRequestError('Logout token config missing');
    }

    return jwt.sign(payload, secret, {
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  verifyLogoutDeviceToken(token: string) {
    const secret = this.config.get<string>('secondaryToken.secret');
    if (!secret) {
      throw gqlBadRequestError('Missing logout token secret');
    }

    try {
      const payload = jwt.verify(token, secret) as LogOutDevicePayload;

      if (payload.type !== TOKEN_TYPE.LOGOUT_TOKEN) {
        throw gqlAuthError('Invalid token type');
      }

      return payload;
    } catch {
      throw gqlAuthError('Invalid or expired logout token');
    }
  }

  /* =======================
        UTIL
     ======================= */
  decode(token: string) {
    return jwt.decode(token);
  }

  getRefreshExpiryDate(): Date {
    const expiresIn = this.config.get<string>('refreshJwt.expiresIn') ?? '7d';
    const match = expiresIn.match(/^(\d+)([mhd])$/);

    if (!match) {
      throw gqlBadRequestError(
        'Invalid refreshJwt.expiresIn format. Use m|h|d (e.g. 30m, 12h, 7d)',
      );
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const date = new Date();

    if (unit === 'm') date.setMinutes(date.getMinutes() + value);
    if (unit === 'h') date.setHours(date.getHours() + value);
    if (unit === 'd') date.setDate(date.getDate() + value);

    return date;
  }
}
