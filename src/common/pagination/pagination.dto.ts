import { IsOptional, IsPositive, Min, IsString } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsPositive()
  @Min(1)
  readonly page?: number = 1;

  @IsOptional()
  @IsPositive()
  @Min(1)
  readonly limit?: number = 5;
}