import { CURRENCY } from 'src/common/enum/currency.enum';
import { Types } from 'mongoose';

export const SYSTEM_USER_ID = new Types.ObjectId('000000000000000000000000');

export const DEFAULT_FREE_MEMBERSHIP = {
  type: 'FREE',
  price: 0,
  currency: CURRENCY.INR,
  description: 'Free starter plan with limited features',
  tags: ['free', 'starter', 'default'],
  isTrialAvailable: false,
  trialDurationDays: null,
  trialPrice: null,
  maxWorkspaces: 1,
  maxDevices: 1,
  maxProjectsPerWorkspace: 3,
  maxUsersPerProject: 2,
  isCancellable: false,
  durationDays: -1, // lifetime
  createdBy: SYSTEM_USER_ID,
  isActive: true,
};
