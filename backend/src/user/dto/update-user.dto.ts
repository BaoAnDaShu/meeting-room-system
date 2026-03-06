import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  @MinLength(6, { message: '密码长度不能少于6位' })
  password?: string;

  @IsString()
  @IsOptional()
  role?: string;
}
