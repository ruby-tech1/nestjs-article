import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponse<T> {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    type: 'boolean',
    example: true,
  })
  private readonly success: boolean;

  @ApiProperty({
    description: 'Response message',
    type: 'string',
    example: 'SUCCESS!',
  })
  private readonly message: string;

  @ApiPropertyOptional({
    description: 'Response payload data',
    // type: 'object',
  })
  private readonly data?: T;

  @ApiPropertyOptional({
    description: 'Additional description or error details',
    oneOf: [{ type: 'string' }, { type: 'object' }],
    example: 'Additional information about the response',
  })
  private readonly description?: string | object;

  @ApiProperty({
    description: 'HTTP status code',
    example: HttpStatus.OK,
    type: Number,
  })
  private readonly status?: number;

  private constructor(
    success: boolean,
    message: string,
    data?: T,
    description?: string | object,
    status?: number,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.description = description;
    this.status = status;
  }

  public static empty<T>(): ApiResponse<T> {
    return new ApiResponse<T>(true, 'SUCCESS!');
  }

  public static success<T>(data: T, status: number): ApiResponse<T> {
    return new ApiResponse<T>(true, 'SUCCESS!', data, undefined, status);
  }

  public static error<T>(
    description: string | object,
    status: number,
  ): ApiResponse<T> {
    return new ApiResponse<T>(true, 'ERROR!', undefined, description, status);
  }
}
