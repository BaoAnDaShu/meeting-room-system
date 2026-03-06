import { IsString, IsNotEmpty, IsNumber, IsInt, Min } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty({ message: '会议室名称不能为空' })
  name: string;

  @IsNumber()
  @IsInt({ message: '容纳人数必须是整数' })
  @Min(1, { message: '容纳人数必须大于0' })
  capacity: number;

  @IsString()
  @IsNotEmpty({ message: '会议室位置不能为空' })
  location: string;

  @IsString()
  status: string;
}
