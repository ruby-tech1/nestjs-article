import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from 'src/users/dto/user.dto';
import { ApiResponse } from 'src/utility/api-response';
import { AuthResponseDto } from './dto/auth-response.dto';
import { VerifyUserDto } from './dto/verify-user-request.dto';
import { AuthRequestDto } from './dto/auth-request.dto';
import { Request } from 'express';
import { RefreshTokenRequest } from './dto/refresh-token-request.dto';
import { Public } from 'src/decorator/public.decorator';
import { ForgotPasswordRequest } from './dto/forgot-password-request.dto';
import { ResetPasswordRequest } from './dto/reset-password-request.dto';
import { VerifyResetPasswordRequest } from './dto/verify-reset-password-request.dto';
import { verifyResetPasswordResponse } from './dto/verify-reset-password-response.dto';

@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() userDto: UserDto): Promise<ApiResponse<string>> {
    const response = await this.authService.register(userDto);
    return ApiResponse.success(response, HttpStatus.CREATED);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyUser(
    @Body() verifyRequest: VerifyUserDto,
  ): Promise<ApiResponse<string>> {
    const response = await this.authService.verifyUser(verifyRequest);
    return ApiResponse.success(response, HttpStatus.OK);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() authRequest: AuthRequestDto,
    @Req() request: Request,
  ): Promise<ApiResponse<AuthResponseDto>> {
    const response = await this.authService.login(authRequest, request);
    return ApiResponse.success(response, HttpStatus.OK);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() refreshRequest: RefreshTokenRequest,
    @Req() request: Request,
  ): Promise<ApiResponse<AuthResponseDto>> {
    const response = await this.authService.refreshToken(
      refreshRequest,
      request,
    );
    return ApiResponse.success(response, HttpStatus.OK);
  }

  @Delete('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: Request): Promise<ApiResponse<string>> {
    const response = await this.authService.logout(request);
    return ApiResponse.success(response, HttpStatus.OK);
  }

  @Get('forgotPassword')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Query() forgotPasswordRequest: ForgotPasswordRequest,
  ): Promise<ApiResponse<string>> {
    const response = await this.authService.forgotPassword(
      forgotPasswordRequest,
    );
    return ApiResponse.success(response, HttpStatus.OK);
  }

  @Post('verifyReset')
  @HttpCode(HttpStatus.OK)
  async verifyReset(
    @Body() verifyReset: VerifyResetPasswordRequest,
  ): Promise<ApiResponse<string>> {
    const response = await this.authService.verifyResetPassword(verifyReset);
    return ApiResponse.success(response, HttpStatus.OK);
  }

  @Post('resetPassword')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordRequest: ResetPasswordRequest,
  ): Promise<ApiResponse<string>> {
    const response = await this.authService.resetPassword(resetPasswordRequest);
    return ApiResponse.success(response, HttpStatus.OK);
  }
}
