import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TestEmailDto {
  @ApiProperty({ example: 'test@example.com', description: 'The email address to send the test to' })
  @IsEmail()
  @IsNotEmpty()
  to: string;
}
