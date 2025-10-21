import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { connectDB } from '../../../database/connectDB';
import { ObjectId } from 'mongodb';
import * as dotenv from "dotenv";
import * as nodemailer from "nodemailer";
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PasswordRecoverDto } from '../dto/password-recover.login.dto';

dotenv.config();                      // Load environment variables
const dbCollection = 'user';          // MongoDB collection name

@Injectable()
export class PasswordService {
  constructor(private readonly jwtService: JwtService) {}

  private readonly collectionName = dbCollection;

  private async getCollection() {
    const db = await connectDB();     // Database connection
    return db.collection(this.collectionName);  // Return the specific collection
  }

//************************** PASSWORD *************************************/
  /*** SERVICE: SEND PASSWORD RECOVERY EMAIL ************/
  async sendPasswordRecoveryEmail(email: string) {
    const collection = await this.getCollection();
    const user = await collection.findOne({ "user.email": email });
    if (!user) throw new NotFoundException(`There is no user with the email ${email}`);

    // A temporary token is generated (15 minutes validity)
    const token = this.jwtService.sign(
      { _id: user._id },
      { secret: process.env.JWT_SECRET, expiresIn: 900 }
    );

    // Link de recuperación
    // const resetLink = `${process.env.BACKEND_URL}/password/reset/${token}`;
    const resetLink = `${process.env.FRONTEND_URL}/password-reset/${token}`;

    // Se configura transporte de correo
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? "587"),
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

  async verifyResetToken(token: string) {
    if (!token) throw new BadRequestException('Token is required');

    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      return { message: 'Valid token', id: payload._id };
    } catch (err) {
      throw new BadRequestException('Invalid or expired token');
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
    await collection.updateOne(
      { _id: user._id },
      { $set: { 'user.password': hashedPassword } }
    );

    return { message: 'Password updated succesfully' };
  }

  
}