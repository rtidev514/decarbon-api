import { Request } from 'express'
import { AccountTypeEnum } from 'src/util/enums'

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)
    if (!token) {
      throw new UnauthorizedException()
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      })
      request['user'] = payload
    } catch {
      throw new UnauthorizedException()
    }
    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}

@Injectable()
export class AccountTypeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  private checkAccess(
    accessLevel: AccountTypeEnum,
    accountTypeToCheck: AccountTypeEnum,
  ): boolean {
    if (accessLevel === AccountTypeEnum.PUBLIC) {
      return true
    }
    if (
      accessLevel === AccountTypeEnum.SUPER_ADMIN &&
      accountTypeToCheck === AccountTypeEnum.SUPER_ADMIN
    ) {
      return true
    }
    if (
      accessLevel === AccountTypeEnum.ADMIN &&
      (accountTypeToCheck === AccountTypeEnum.SUPER_ADMIN ||
        accountTypeToCheck === AccountTypeEnum.ADMIN)
    ) {
      return true
    }
    if (
      accessLevel === AccountTypeEnum.USER &&
      (accountTypeToCheck === AccountTypeEnum.SUPER_ADMIN ||
        accountTypeToCheck === AccountTypeEnum.ADMIN ||
        accountTypeToCheck === AccountTypeEnum.USER)
    ) {
      return true
    }
    return false
  }
  canActivate(context: ExecutionContext): boolean {
    const requiredAccountType = this.reflector.get<string>(
      'accountType',
      context.getHandler(),
    )
    if (requiredAccountType === AccountTypeEnum.PUBLIC) {
      return true // No check required, allow access
    }

    const request = context.switchToHttp().getRequest()
    const user = request['user']
    return this.checkAccess(
      requiredAccountType as AccountTypeEnum,
      user.accountType,
    )
  }
}
