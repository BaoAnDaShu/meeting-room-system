import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';

@Injectable()
export class RoomService {
  // 注入数据库操作工具（无需手动配置，自动关联）
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  // 1. 获取所有会议室（给前端提供数据）
  async findAll(): Promise<Room[]> {
    return this.roomRepository.find();
  }

  // 2. 添加会议室（接收前端提交的表单数据）
  async create(roomData: Partial<Room>): Promise<Room> {
    const room = this.roomRepository.create(roomData);
    return this.roomRepository.save(room);
  }

  // 3. 根据ID获取单个会议室（后续扩展用）
  async findOne(id: number): Promise<Room | null> {
    return this.roomRepository.findOne({ where: { id } });
  }
  // 4. 修改会议室状态（预定/取消预定用）
  async updateRoomStatus(id: number, status: string): Promise<Room> {
    const room = await this.findOne(id);
    if (!room) {
      throw new Error(`会议室ID ${id} 不存在`);
    }
    room.status = status; // 修改状态（可用/已预定）
    return this.roomRepository.save(room);
  }
}
