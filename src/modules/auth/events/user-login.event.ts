import { Device } from 'src/modules/devices/entities/device.entity';

export class UserLoginEvent {
  constructor(
    private readonly userId: string,
    private readonly email: string,
    private readonly name: string,
    private readonly device: Device,
    private readonly token: string,
  ) {}
}
