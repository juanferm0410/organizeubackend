import { Controller, Get, Post, Patch, Param, Body, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PasswordService } from '../service/password.service';
import * as dotenv from "dotenv";
import { JwtService } from '@nestjs/jwt';
import { PasswordRecoverDto } from '../dto/password-recover.login.dto';

dotenv.config();                  // Load environment variables

@Controller('password')
export class PasswordController {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService
  ) {}

//************************** PASSWORD *************************************/
  // Service: Send password recovery email
  @Post('recover')
  async recoverPassword(@Body() passwordRecoverDto: PasswordRecoverDto) {
    if (!passwordRecoverDto.email) throw new BadRequestException('Email is requested');
    return this.passwordService.sendPasswordRecoveryEmail(passwordRecoverDto.email);

  }

  // Service: Send Token password recovery email
  @Get('reset/:token')
  async verifyResetToken(@Param('token') token: string) {
    return this.passwordService.verifyResetToken(token);
  }

  // Service: Password update
  @Patch('update')
  async updatePassword(@Body() body: { token: string; newPassword: string }) {
    const { token, newPassword } = body;
    if (!token || !newPassword) throw new BadRequestException('Token and new password are required');

    try {
      // Verifica token y extrae email
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      const id = payload._id;

      // Actualiza contraseña
      await this.passwordService.updatePasswordById(id, newPassword);

      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

}