import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { CustomJwtService } from 'src/token/jwt.service';
import { IS_PUBLIC_KEY } from 'src/decorator/public.decorator';

interface UserInfo {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserInfo;
    }
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: CustomJwtService,
    private reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const bearerToken = this.extractTokenFromHeader(request);

    if (!bearerToken) {
      throw new UnauthorizedException('Invalid Token Credentials');
    }

    const payload = this.jwtService.verifyJwtToken(bearerToken);
    if (!request.user) {
      request.user = { id: payload.userId, role: '' };
    } else {
      request.user.id = payload.userId;
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
