import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import type { AuthenticatedUser } from './auth.types';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const userId = await this.authService.validateUser(dto.usernameOrEmail, dto.password);
    if (!userId) {
      // Constant message — never leak whether email exists.
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(userId);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.authService.buildUserProfile(user.id);
    if (!profile) {
      throw new UnauthorizedException('User no longer available');
    }
    return profile;
  }

  /**
   * Logout is client-side for now (drop tokens). Server-side revocation
   * (refresh blacklist) lands in BE-0202.
   */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout() {
    return;
  }
}
