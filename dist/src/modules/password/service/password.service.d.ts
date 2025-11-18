import { JwtService } from '@nestjs/jwt';
export declare class PasswordService {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    private readonly collectionName;
    private getCollection;
    sendPasswordRecoveryEmail(email: string, origin?: 'web' | 'mobile'): Promise<{
        message: string;
    }>;
    verifyResetToken(token: string): Promise<{
        message: string;
        id: any;
    }>;
    updatePasswordById(id: string, newPassword: string): Promise<{
        message: string;
    }>;
}
