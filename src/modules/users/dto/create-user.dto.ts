import { CreateTaskDto } from '../../tasks/dto/create-task.dto';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  username: string;
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
  tasks?: CreateTaskDto[];
}
