import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/service/users.service';
import { LoginDto } from '../dto/login.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(loginDto: LoginDto): Promise<any>;
    generateToken(user: any): Promise<{
        token: string;
        id: any;
    }>;
    getByUsername(username: string): Promise<import("mongodb").WithId<import("bson").Document>>;
}
