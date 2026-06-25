import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private readonly cfg;
    constructor(cfg: ConfigService);
    sendVerification(email: string, token: string): Promise<void>;
    sendPasswordReset(email: string, token: string): Promise<void>;
    private send;
}
