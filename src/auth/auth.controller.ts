import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
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
import { Public } from 'src/utility/custom-auth-public';

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
}
