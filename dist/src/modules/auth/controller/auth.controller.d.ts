import { AuthService } from '../service/auth.service';
import { LoginDto } from '../dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        token: string;
        id: any;
    }>;
}
