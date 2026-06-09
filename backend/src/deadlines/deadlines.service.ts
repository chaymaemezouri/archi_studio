import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeadlineDto } from './dto/create-deadline.dto';
import { UpdateDeadlineDto } from './dto/update-deadline.dto';

@Injectable()
export class DeadlinesService {
  constructor(private prisma: PrismaService) {}

  findAll(projectId?: string) {
    return this.prisma.deadline.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { date: 'asc' },
    });
  }

  async findOne(id: string) {
    const deadline = await this.prisma.deadline.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!deadline) throw new NotFoundException('Deadline not found');
    return deadline;
  }

  create(dto: CreateDeadlineDto) {
    return this.prisma.deadline.create({
      data: { ...dto, date: new Date(dto.date) },
    });
  }

  async update(id: string, dto: UpdateDeadlineDto) {
    await this.findOne(id);
    return this.prisma.deadline.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.deadline.delete({ where: { id } });
    return { deleted: true };
  }
}
