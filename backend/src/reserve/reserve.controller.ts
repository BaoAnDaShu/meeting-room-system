import { Controller, Post, Body, Get, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { ReserveService } from './reserve.service';
import { Reserve } from './reserve.entity';
import { CreateReserveDto } from './dto/create-reserve.dto';
import { Permissions } from '../auth/permissions.decorator';
import { Permission } from '../auth/permissions.enum';
import { PermissionsGuard } from '../auth/permissions.guard';

@Controller('reserves') // 接口前缀：所有预定相关接口以 /reserves 开头
export class ReserveController {
  constructor(private readonly reserveService: ReserveService) {}

  // 接口1：预定会议室（POST请求，前端提交预定信息）
  // 权限：需要 RESERVE_CREATE 权限
  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.RESERVE_CREATE)
  async create(@Body() reserveData: CreateReserveDto): Promise<Reserve> {
    return this.reserveService.create(reserveData);
  }

  // 接口2：取消预定（DELETE请求，根据预定ID取消）
  // 权限：需要 RESERVE_CANCEL_SELF 或 RESERVE_CANCEL_ALL 权限
  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.RESERVE_CANCEL_SELF, Permission.RESERVE_CANCEL_ALL)
  async cancel(@Param('id') id: string): Promise<Reserve> {
    return this.reserveService.cancel(+id);
  }

  // 接口3：查看我的预定（GET请求，根据用户ID获取预定记录）
  // 公开接口，用于前端获取当前用户的预定
  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<Reserve[]> {
    return this.reserveService.findByUserId(+userId);
  }

  // 接口4：获取所有预定（管理后台和日历视图用）
  // 权限：需要 RESERVE_VIEW_ALL 权限
  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.RESERVE_VIEW_ALL)
  async findAll(): Promise<Reserve[]> {
    return this.reserveService.findAll();
  }

  // 接口5：根据预定ID获取单个预定记录（后续扩展用）
  // 公开接口
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Reserve> {
    const reserve = await this.reserveService.findOne(+id);
    if (!reserve) {
      throw new NotFoundException(`预定ID ${id} 不存在`);
    }
    return reserve;
  }
}
