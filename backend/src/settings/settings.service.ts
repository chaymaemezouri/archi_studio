import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private uploadsService: UploadsService,
  ) {}
  async get(studioId: string) {
    return this.prisma.settings.upsert({
      where: { studioId },
      update: {},
      create: {
        studioId,
        cabinetName: 'Mon cabinet',
      },
    });
  }

  async update(studioId: string, dto: UpdateSettingsDto) {
    await this.get(studioId);
    const settings = await this.prisma.settings.update({
      where: { studioId },
      data: dto,
    });

    if (dto.cabinetName !== undefined || dto.cabinetLogo !== undefined) {
      await this.prisma.studio.update({
        where: { id: studioId },
        data: {
          ...(dto.cabinetName !== undefined ? { name: dto.cabinetName } : {}),
          ...(dto.cabinetLogo !== undefined ? { logoUrl: dto.cabinetLogo } : {}),
        },
      });
    }

    return settings;
  }

  listTeamMembers(studioId: string) {
    return this.prisma.user.findMany({
      where: { studioId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });
  }

  async uploadLogo(studioId: string, file: Express.Multer.File) {
    const uploaded = this.uploadsService.saveBrandingImage(
      file,
      'studio-logo',
      studioId,
    );
    return this.update(studioId, { cabinetLogo: uploaded.url });
  }

  async assertStudioResource(studioId: string, resourceStudioId: string) {    if (resourceStudioId !== studioId) {
      throw new NotFoundException();
    }
  }
}
