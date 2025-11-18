import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { ObjectId } from 'mongodb';
import * as nodemailer from 'nodemailer';
import { connectDB } from '../../../database/connectDB';

dotenv.config(); // Load environment variables
const dbCollection = 'user'; // MongoDB collection name

@Injectable()
export class PasswordService {
  constructor(private readonly jwtService: JwtService) {}

  private readonly collectionName = dbCollection;

  private async getCollection() {
    const db = await connectDB(); // Database connection
    return db.collection(this.collectionName); // Return the specific collection
  }

  //************************** PASSWORD *************************************/
  /*** SERVICE: SEND PASSWORD RECOVERY EMAIL ************/
  async sendPasswordRecoveryEmail(email: string, origin: 'web' | 'mobile' = 'web') {
    const collection = await this.getCollection();
    const user = await collection.findOne({ 'user.email': email });
    if (!user) throw new NotFoundException(`El email ${email} no está registrado`);

    // A temporary token is generated (15 minutes validity)
    const token = this.jwtService.sign({ _id: user._id }, { secret: process.env.JWT_SECRET, expiresIn: 900 });

    // Elegir baseUrl según origen
    const baseUrl = origin === 'mobile' ? (process.env.FRONTEND_URL_PROD_MOBILE || `${process.env.HOST}:${process.env.FRONTEND_MOBILE_PORT}`) : (process.env.FRONTEND_URL_PROD_WEB || `${process.env.HOST}:${process.env.FRONTEND_WEB_PORT}`);

    // Link de recuperación
    const resetLink = `http://${baseUrl}/password-reset/${token}`;

    // Se configura transporte de correo
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Envia correo con el enlace de recuperación
    const info = await transporter.sendMail({
      from: `"Soporte OrganizeU" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Recuperación de contraseña',
      html: `
        <h3 style="font-weight:900;font-style:italic;font-size:1.25rem;text-align:center;">Organize<span style="color:#107ACC;">U</span></h3>
        <h3>Hola ${user.user?.name ?? 'Usuario'},</h3>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para establecer una nueva contraseña (válido por 15 minutos):</p>
        <a href="${resetLink}" style="background-color:#5c3b99;color:white;padding:10px 15px;border-radius:5px;text-decoration:none;">Restablecer contraseña</a>
        <br /><br />
        <p>Este enlace estará disponible por 15 minutos.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
        <p style="color:gray;font-size:12px;">Este correo fue generado automáticamente, no respondas a este mensaje.</p>
      `,
    });

    console.log(`Recovery email sent to ${email}:`, info.messageId);
    return { message: `Link de recuperación enviado a ${email}` };
  }

  async verifyResetToken(token: string) {
    if (!token) throw new BadRequestException('Token is required');

    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      return { message: 'Token válido o expirado', id: payload._id };
    } catch (err) {
      throw new BadRequestException('Token inválido o expirado');
    }
  }

  /*** SERVICE: VERIFY TOKEN ************/
  async updatePasswordById(id: string, newPassword: string) {
    const collection = await this.getCollection();
    const user = await collection.findOne({ _id: new ObjectId(id) });
    if (!user) throw new NotFoundException('User not found');

    // Encriptar contraseña nueva
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar en Mongo
    await collection.updateOne({ _id: user._id }, { $set: { 'user.password': hashedPassword } });

    return { message: 'Contraseña actualizada' };
  }
}
