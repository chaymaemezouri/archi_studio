import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenderDto } from './dto/create-tender.dto';
import { UpdateTenderDto } from './dto/update-tender.dto';

@Injectable()
export class TendersService {
  constructor(private prisma: PrismaService) {}

  findAll(studioId: string) {
    return this.prisma.tender.findMany({
      where: { studioId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, studioId: string) {
    const tender = await this.prisma.tender.findFirst({
      where: { id, studioId },
    });
    if (!tender) throw new NotFoundException('Tender not found');
    return tender;
  }

  create(dto: CreateTenderDto, studioId: string) {
    return this.prisma.tender.create({
      data: {
        ...dto,
        studioId,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateTenderDto, studioId: string) {
    await this.findOne(id, studioId);
    return this.prisma.tender.update({
      where: { id },
      data: {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      },
    });
  }

  async remove(id: string, studioId: string) {
    await this.findOne(id, studioId);
    await this.prisma.tender.delete({ where: { id } });
    return { deleted: true };
  }
}
