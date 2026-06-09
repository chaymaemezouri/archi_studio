import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChantierLogDto } from './dto/create-chantier-log.dto';
import { UpdateChantierLogDto } from './dto/update-chantier-log.dto';

@Injectable()
export class ChantierService {
  constructor(private prisma: PrismaService) {}

  findAll(projectId?: string) {
    return this.prisma.chantierLog.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const log = await this.prisma.chantierLog.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!log) throw new NotFoundException('Chantier log not found');
    return log;
  }

  create(dto: CreateChantierLogDto) {
    return this.prisma.chantierLog.create({
      data: {
        ...dto,
        date: new Date(dto.date),
        photos: dto.photos ?? [],
      },
    });
  }

  async update(id: string, dto: UpdateChantierLogDto) {
    await this.findOne(id);
    return this.prisma.chantierLog.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.chantierLog.delete({ where: { id } });
    return { deleted: true };
  }
}
