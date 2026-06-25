import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Verifies the Clerk session token sent as `Authorization: Bearer <token>`,
 * then loads (or lazily creates) the matching local `User` row so the rest
 * of the app works against our own `User.id` / `User.role`, not Clerk's.
 *
 * Attaches `req.user: User` on success.
 */
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly clerk;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.clerk = createClerkClient({ secretKey: this.config.get<string>('CLERK_SECRET_KEY') });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader: string | undefined = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const token = authHeader.slice('Bearer '.length);

    try {
      const claims = await this.clerk.verifyToken(token);

      const clerkUser = await this.clerk.users.getUser(claims.sub);
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? `${claims.sub}@unknown.spx`;

      const user = await this.prisma.user.upsert({
        where: { clerkId: claims.sub },
        update: { email },
        create: {
          clerkId: claims.sub,
          email,
          name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || email,
          role: (clerkUser.publicMetadata?.role as any) ?? 'TENANT',
        },
      });

      req.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired session token');
    }
  }
}
