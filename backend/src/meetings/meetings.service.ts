import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}

  findAll(projectId?: string) {
    return this.prisma.meeting.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { date: 'asc' },
    });
  }

  async findOne(id: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
      include: {
        project: true,
        attendees: { select: { id: true, name: true, email: true } },
      },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    return meeting;
  }

  create(dto: CreateMeetingDto) {
    const { attendeeIds, ...data } = dto;
    return this.prisma.meeting.create({
      data: {
        ...data,
        date: new Date(dto.date),
        attendees: attendeeIds?.length
          ? { connect: attendeeIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { attendees: true },
    });
  }

  async update(id: string, dto: UpdateMeetingDto) {
    await this.findOne(id);
    const { attendeeIds, ...data } = dto;
    return this.prisma.meeting.update({
      where: { id },
      data: {
        ...data,
        date: dto.date ? new Date(dto.date) : undefined,
        attendees: attendeeIds
          ? { set: attendeeIds.map((uid) => ({ id: uid })) }
          : undefined,
      },
      include: { attendees: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.meeting.delete({ where: { id } });
    return { deleted: true };
  }
}
