import { ForbiddenException } from '@nestjs/common';

export const DEMO_ACCOUNT_EXPIRED = 'DEMO_ACCOUNT_EXPIRED';

export function assertDemoStudioActive(
  demoExpiresAt: Date | null | undefined,
): void {
  if (demoExpiresAt == null) return;
  if (new Date(demoExpiresAt).getTime() <= Date.now()) {
    throw new ForbiddenException({
      statusCode: 403,
      error: DEMO_ACCOUNT_EXPIRED,
      message: 'Ce compte démo a expiré',
    });
  }
}
