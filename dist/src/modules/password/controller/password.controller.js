"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordController = void 0;
const common_1 = require("@nestjs/common");
const password_service_1 = require("../service/password.service");
const dotenv = __importStar(require("dotenv"));
const jwt_1 = require("@nestjs/jwt");
const password_recover_login_dto_1 = require("../dto/password-recover.login.dto");
dotenv.config();
let PasswordController = class PasswordController {
    constructor(passwordService, jwtService) {
        this.passwordService = passwordService;
        this.jwtService = jwtService;
    }
    async recoverPassword(passwordRecoverDto) {
        if (!passwordRecoverDto.email)
            throw new common_1.BadRequestException('Email is requested');
        return this.passwordService.sendPasswordRecoveryEmail(passwordRecoverDto.email);
    }
    async verifyResetToken(token) {
        return this.passwordService.verifyResetToken(token);
    }
    async updatePassword(body) {
        const { token, newPassword } = body;
        if (!token || !newPassword)
            throw new common_1.BadRequestException('Token and new password are required');
        try {
            const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
            const id = payload._id;
            await this.passwordService.updatePasswordById(id, newPassword);
            return { message: 'Password updated successfully' };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
};
exports.PasswordController = PasswordController;
__decorate([
    (0, common_1.Post)('recover'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_recover_login_dto_1.PasswordRecoverDto]),
    __metadata("design:returntype", Promise)
], PasswordController.prototype, "recoverPassword", null);
__decorate([
    (0, common_1.Get)('reset/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PasswordController.prototype, "verifyResetToken", null);
__decorate([
    (0, common_1.Patch)('update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PasswordController.prototype, "updatePassword", null);
exports.PasswordController = PasswordController = __decorate([
    (0, common_1.Controller)('password'),
    __metadata("design:paramtypes", [password_service_1.PasswordService,
        jwt_1.JwtService])
], PasswordController);
//# sourceMappingURL=password.controller.js.map