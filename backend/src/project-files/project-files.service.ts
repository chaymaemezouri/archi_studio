import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectFileDto } from './dto/create-project-file.dto';
import { UpdateProjectFileDto } from './dto/update-project-file.dto';

@Injectable()
export class ProjectFilesService {
  constructor(private prisma: PrismaService) {}

  findAll(projectId?: string) {
    return this.prisma.projectFile.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  findByType(projectId: string, fileType: string) {
    return this.prisma.projectFile.findMany({
      where: { projectId, fileType },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const file = await this.prisma.projectFile.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  create(dto: CreateProjectFileDto) {
    return this.prisma.projectFile.create({ data: dto });
  }

  async update(id: string, dto: UpdateProjectFileDto) {
    await this.findOne(id);
    return this.prisma.projectFile.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const file = await this.findOne(id);
    await this.prisma.projectFile.delete({ where: { id } });

    // A deleted file must not stay as the project cover
    if (file.project?.imageUrl === file.url) {
      await this.prisma.project.update({
        where: { id: file.projectId },
        data: { imageUrl: null },
      });
    }

    return { deleted: true };
  }
}
