import { IsNotEmpty, IsEmail } from 'class-validator';

export class PasswordRecoverDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'El email es obligatorio' }) 
  email: string
}