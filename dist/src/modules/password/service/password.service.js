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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordService = void 0;
const common_1 = require("@nestjs/common");
const connectDB_1 = require("../../../database/connectDB");
const mongodb_1 = require("mongodb");
const dotenv = __importStar(require("dotenv"));
const nodemailer = __importStar(require("nodemailer"));
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
dotenv.config();
const dbCollection = 'user';
let PasswordService = class PasswordService {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.collectionName = dbCollection;
    }
    async getCollection() {
        const db = await (0, connectDB_1.connectDB)();
        return db.collection(this.collectionName);
    }
    async sendPasswordRecoveryEmail(email) {
        const collection = await this.getCollection();
        const user = await collection.findOne({ "user.email": email });
        if (!user)
            throw new common_1.NotFoundException(`There is no user with the email ${email}`);
        const token = this.jwtService.sign({ _id: user._id }, { secret: process.env.JWT_SECRET, expiresIn: 900 });
        const resetLink = `${process.env.FRONTEND_URL}/password-reset/${token}`;
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT ?? "587"),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        const info = await transporter.sendMail({
            from: `"Soporte OrganizeU" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Recuperación de contraseña",
            html: `
        <h2>Hola ${user.user?.name ?? 'Usuario'},</h2>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para establecer una nueva contraseña (válido por 15 minutos):</p>
        <a href="${resetLink}" style="background-color:#007bff;color:white;padding:10px 15px;border-radius:5px;text-decoration:none;">Restablecer contraseña</a>
        <br /><br />
        <p>Este enlace estará disponible por 15 minutos.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
        <p style="color:gray;font-size:12px;">Este correo fue generado automáticamente, no respondas a este mensaje.</p>
      `,
        });
        console.log(`Recovery email sent to ${email}:`, info.messageId);
        return { message: `Recovery link sent to ${email}` };
    }
    async verifyResetToken(token) {
        if (!token)
            throw new common_1.BadRequestException('Token is required');
        try {
            const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
            return { message: 'Valid token', id: payload._id };
        }
        catch (err) {
            throw new common_1.BadRequestException('Invalid or expired token');
        }
    }
    async updatePasswordById(id, newPassword) {
        const collection = await this.getCollection();
        const user = await collection.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await collection.updateOne({ _id: user._id }, { $set: { 'user.password': hashedPassword } });
        return { message: 'Password updated succesfully' };
    }
};
exports.PasswordService = PasswordService;
exports.PasswordService = PasswordService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], PasswordService);
//# sourceMappingURL=password.service.js.map