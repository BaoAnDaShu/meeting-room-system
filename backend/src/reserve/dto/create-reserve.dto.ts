import { IsString, IsNotEmpty, IsNumber, IsInt, Matches } from 'class-validator';

export class CreateReserveDto {
  @IsString()
  @IsNotEmpty({ message: '预定日期不能为空' })
  reserveDate: string;

  @IsString()
  @IsNotEmpty({ message: '开始时间不能为空' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: '开始时间格式错误，应为 HH:mm' })
  startTime: string;

  @IsString()
  @IsNotEmpty({ message: '结束时间不能为空' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: '结束时间格式错误，应为 HH:mm' })
  endTime: string;

  @IsNumber()
  @IsInt({ message: '用户ID必须是整数' })
  @IsNotEmpty({ message: '用户ID不能为空' })
  userId: number;

  @IsNumber()
  @IsInt({ message: '会议室ID必须是整数' })
  @IsNotEmpty({ message: '会议室ID不能为空' })
  roomId: number;

  @IsString()
  status: string;
}
