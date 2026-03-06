import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserve } from './reserve.entity';
import { RoomService } from '../room/room.service';
import { UserService } from '../user/user.service';

@Injectable()
export class ReserveService {
  constructor(
    @InjectRepository(Reserve)
    private reserveRepository: Repository<Reserve>,
    private roomService: RoomService, // 注入会议室服务（校验会议室是否存在）
    private userService: UserService, // 注入用户服务（校验用户是否存在）
  ) {}

  // 1. 预定会议室（核心功能）
  async create(reserveData: Partial<Reserve>): Promise<Reserve> {
    // 校验1：用户和会议室ID不能为空
    if (!reserveData.userId || !reserveData.roomId) {
      throw new NotFoundException('用户ID和会议室ID不能为空');
    }
    // 校验2：用户和会议室是否存在
    const user = await this.userService.findOne(reserveData.userId);
    const room = await this.roomService.findOne(reserveData.roomId);
    if (!user) {
      throw new NotFoundException(`用户ID ${reserveData.userId} 不存在`);
    }
    if (!room) {
      throw new NotFoundException(`会议室ID ${reserveData.roomId} 不存在`);
    }

    // 校验2：会议室是否已被预定（同一日期+同一时间段，不能重复预定）
    const existingReserve = await this.reserveRepository.findOne({
      where: {
        roomId: reserveData.roomId,
        reserveDate: reserveData.reserveDate,
        timeSlot: reserveData.timeSlot,
        status: '正常', // 排除已取消的预定
      },
    });
    if (existingReserve) {
      throw new ConflictException(`该会议室在 ${reserveData.reserveDate} ${reserveData.timeSlot} 已被预定`);
    }

    // 步骤1：创建预定记录
    const reserve = this.reserveRepository.create(reserveData);
    const savedReserve = await this.reserveRepository.save(reserve);

    return savedReserve;
  }

  // 2. 取消预定（核心功能）
  async cancel(id: number): Promise<Reserve> {
    // 查找预定记录
    const reserve = await this.reserveRepository.findOne({
      where: { id },
      relations: ['room'], // 关联查询会议室信息
    });
    if (!reserve) {
      throw new NotFoundException(`预定ID ${id} 不存在`);
    }

    // 校验：预定是否已取消
    if (reserve.status === '已取消') {
      throw new ConflictException(`该预定已取消`);
    }

    // 步骤1：修改预定状态为「已取消」
    reserve.status = '已取消';
    const updatedReserve = await this.reserveRepository.save(reserve);

    return updatedReserve;
  }

  // 3. 查看我的预定（根据用户ID，获取该用户的所有预定记录）
  async findByUserId(userId: number): Promise<Reserve[]> {
    // 关联查询会议室信息（显示预定的会议室名称、位置）
    return this.reserveRepository.find({
      where: { userId },
      relations: ['room'],
      order: { reserveDate: 'ASC' }, // 按预定日期升序排列
    });
  }

  // 4. 根据预定ID获取单个预定记录（后续取消预定用）
  async findOne(id: number): Promise<Reserve | null> {
    return this.reserveRepository.findOne({ where: { id } });
  }

  // 5. 获取所有预定（管理后台和日历视图用）
  async findAll(): Promise<Reserve[]> {
    return this.reserveRepository.find({
      relations: ['room', 'user'],
      order: { reserveDate: 'ASC' },
    });
  }
}
