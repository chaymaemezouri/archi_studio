import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AuthUser } from '../../common/types/auth-user';
import { assertDemoStudioActive } from '../../common/utils/demo-expiration.util';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  studioId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        studioId: true,
        studio: {
          select: {
            id: true,
            slug: true,
            name: true,
            logoUrl: true,
            demoExpiresAt: true,
          },
        },
      },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    assertDemoStudioActive(user.studio.demoExpiresAt);
    const { demoExpiresAt: _, ...studio } = user.studio;
    return { ...user, studio };
  }
}
