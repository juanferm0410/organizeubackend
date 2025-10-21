import { IsNotEmpty } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;
  @IsNotEmpty({ message: 'La hora es obligatoria' })
  time: string;
  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  date: string;
  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  message: string;
}