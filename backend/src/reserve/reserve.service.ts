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

    // 校验3：时间格式和逻辑
    if (!reserveData.startTime || !reserveData.endTime) {
      throw new ConflictException('开始时间和结束时间不能为空');
    }

    // 校验4：结束时间必须晚于开始时间
    if (reserveData.startTime >= reserveData.endTime) {
      throw new ConflictException('结束时间必须晚于开始时间');
    }

    // 校验5：检查时间冲突（精确到分钟）
    const hasConflict = await this.checkTimeConflict(
      reserveData.roomId!,
      reserveData.reserveDate!,
      reserveData.startTime!,
      reserveData.endTime!
    );
    
    if (hasConflict) {
      throw new ConflictException(`该会议室在 ${reserveData.reserveDate} ${reserveData.startTime}-${reserveData.endTime} 时间段已被预定`);
    }

    // 步骤1：创建预定记录
    const reserve = this.reserveRepository.create(reserveData);
    const savedReserve = await this.reserveRepository.save(reserve);

    return savedReserve;
  }

  // 检查时间冲突
  private async checkTimeConflict(
    roomId: number,
    reserveDate: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    // 获取该日期该会议室的所有正常预定
    const existingReserves = await this.reserveRepository.find({
      where: {
        roomId,
        reserveDate,
        status: '正常',
      },
    });

    // 检查是否有时间重叠
    for (const reserve of existingReserves) {
      // 时间重叠条件：
      // 新区间的开始时间 < 已有区间的结束时间 且 新区间的结束时间 > 已有区间的开始时间
      if (
        startTime < reserve.endTime &&
        endTime > reserve.startTime
      ) {
        return true; // 有冲突
      }
    }

    return false; // 无冲突
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
