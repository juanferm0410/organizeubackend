import { Controller, Get, Post, Patch, Param, Body, BadRequestException, UnauthorizedException, Headers } from '@nestjs/common';
import { PasswordService } from '../service/password.service';
import * as dotenv from 'dotenv';
import { JwtService } from '@nestjs/jwt';
import { PasswordRecoverDto } from '../dto/password-recover.login.dto';

dotenv.config(); // Load environment variables

@Controller('password')
export class PasswordController {
  constructor(private readonly passwordService: PasswordService, private readonly jwtService: JwtService) {}

  //************************** PASSWORD *************************************/
  // Service: Send password recovery email
  @Post('recover')
  async recoverPassword(
    @Body() passwordRecoverDto: PasswordRecoverDto,
    @Headers('x-client') client: string, // "web" | "mobile"
  ) {
    if (!passwordRecoverDto.email) {
      throw new BadRequestException('Email is requested');
    }

    // Normalizo el origen: por defecto "web"
    const origin: 'web' | 'mobile' = client && client.toLowerCase() === 'mobile' ? 'mobile' : 'web';

    return this.passwordService.sendPasswordRecoveryEmail(passwordRecoverDto.email, origin);
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
    if (!token || !newPassword) {
      throw new BadRequestException('Ingresa la nueva contraseña');
    }

    try {
      // Verifica token y extrae id
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      const id = payload._id;

      // Actualiza contraseña
      await this.passwordService.updatePasswordById(id, newPassword);

      return { message: 'Contraseña actualizada' };
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
