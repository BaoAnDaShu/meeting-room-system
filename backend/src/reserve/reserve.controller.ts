import { Controller, Post, Body, Get, Param, Delete, NotFoundException } from '@nestjs/common';
import { ReserveService } from './reserve.service';
import { Reserve } from './reserve.entity';

@Controller('reserves') // 接口前缀：所有预定相关接口以 /reserves 开头
export class ReserveController {
  constructor(private readonly reserveService: ReserveService) {}

  // 接口1：预定会议室（POST请求，前端提交预定信息）
  @Post()
  async create(@Body() reserveData: Partial<Reserve>): Promise<Reserve> {
    // 简单校验：确保核心字段不为空
    if (!reserveData.userId || !reserveData.roomId || !reserveData.reserveDate || !reserveData.timeSlot) {
      throw new Error('用户ID、会议室ID、预定日期、时间段不能为空');
    }
    return this.reserveService.create(reserveData);
  }

  // 接口2：取消预定（DELETE请求，根据预定ID取消）
  @Delete(':id')
  async cancel(@Param('id') id: string): Promise<Reserve> {
    return this.reserveService.cancel(+id);
  }

  // 接口3：查看我的预定（GET请求，根据用户ID获取预定记录）
  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<Reserve[]> {
    return this.reserveService.findByUserId(+userId);
  }

  // 接口4：根据预定ID获取单个预定记录（后续扩展用）
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Reserve> {
    const reserve = await this.reserveService.findOne(+id);
    if (!reserve) {
      throw new NotFoundException(`预定ID ${id} 不存在`);
    }
    return reserve;
  }
}
