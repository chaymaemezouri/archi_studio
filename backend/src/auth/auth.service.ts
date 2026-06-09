import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { resolveStudioIdByInvite } from '../common/constants/studio-invites';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const BCRYPT_ROUNDS = 12;

const userWithStudioSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  avatar: true,
  studioId: true,
  createdAt: true,
  studio: {
    select: {
      id: true,
      slug: true,
      name: true,
      logoUrl: true,
    },
  },
} as const;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private uploadsService: UploadsService,
  ) {}

  async register(dto: RegisterDto) {
    const studioId = await resolveStudioIdByInvite(this.prisma, dto.inviteCode);
    if (!studioId) {
      throw new UnauthorizedException('Invalid invite code');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const password = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password,
        avatar: dto.avatar,
        studioId,
      },
      select: userWithStudioSelect,
    });

    return {
      user,
      accessToken: this.signToken(user.id, user.email, user.studioId),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        ...userWithStudioSelect,
        password: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken: this.signToken(safeUser.id, safeUser.email, safeUser.studioId),
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userWithStudioSelect,
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      },
      select: userWithStudioSelect,
    });
    return user;
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const uploaded = this.uploadsService.saveBrandingImage(
      file,
      'user-avatar',
      userId,
    );
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: uploaded.url },
      select: userWithStudioSelect,
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'Le nouveau mot de passe doit être différent',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });
    if (!user) throw new UnauthorizedException();

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    const password = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password },
    });

    return { success: true };
  }

  private signToken(sub: string, email: string, studioId: string) {
    return this.jwt.sign(
      { sub, email, studioId },
      {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN', '7d'),
      },
    );
  }
}
