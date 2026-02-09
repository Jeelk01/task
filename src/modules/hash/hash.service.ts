import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";

@Injectable()
export class HashService {
     constructor(private readonly config: ConfigService) { }

     private getPepper(): string {
          return this.config.get<string>('hash.pepper') ?? '';
     }

     private getSaltRounds(): number {
          return Number(this.config.get<number>('hash.saltRounds') ?? 10);
     }

     async hashPassword(password: string): Promise<string> {
          const peppered = password + this.getPepper();
          return bcrypt.hash(peppered, this.getSaltRounds());
     }

     async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
          const peppered = password + this.getPepper();
          return bcrypt.compare(peppered, hashedPassword);
     }

     async hashString(str: string): Promise<string> {
          return bcrypt.hash(str, this.getSaltRounds())
     }

     async compareString(str: string, hashedString: string) {
          return bcrypt.compare(str, hashedString)
     }
}
