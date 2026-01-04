import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string; 

  @IsString()
  @MinLength(6)
  @MaxLength(30)
  password: string;
}
