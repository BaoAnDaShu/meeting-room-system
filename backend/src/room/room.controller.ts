import { Controller, Get, Post, Body, Param, NotFoundException, Put, Delete } from '@nestjs/common';
import { RoomService } from './room.service';
import { Room } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('rooms') // 接口前缀：所有接口都以 /rooms 开头（匹配实际启动日志）
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  // 接口1：获取所有会议室（GET请求，前端调用这个接口拿数据）
  @Get()
  findAll(): Promise<Room[]> {
    return this.roomService.findAll();
  }

  // 接口2：添加会议室（POST请求，前端提交表单数据到这个接口）
  @Post()
  create(@Body() roomData: CreateRoomDto): Promise<Room> {
    return this.roomService.create(roomData);
  }

  // 接口3：根据ID获取单个会议室（后续扩展用，GET请求：/rooms/1）
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Room> {
    const room = await this.roomService.findOne(+id); // +id 表示把字符串ID转为数字
    // 修复TS类型错误：判断是否查询到会议室，未查询到则抛出404异常（避免返回null）
    if (!room) {
      throw new NotFoundException(`会议室ID ${id} 不存在`);
    }
    return room;
  }

  // 接口4：修改会议室状态接口（PUT请求，预定/取消预定调用）
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<Room> {
    return this.roomService.updateRoomStatus(+id, status);
  }

  // 接口5：删除会议室（DELETE请求）
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.roomService.delete(+id);
  }
}
