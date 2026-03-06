import { IsString, IsNotEmpty, IsNumber, IsInt } from 'class-validator';

export class CreateReserveDto {
  @IsString()
  @IsNotEmpty({ message: '预定日期不能为空' })
  reserveDate: string;

  @IsString()
  @IsNotEmpty({ message: '预定时间段不能为空' })
  timeSlot: string;

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
