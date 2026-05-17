import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT token' })
  @ApiResponse({ status: 200, description: 'Successfully authenticated, returns JWT token.' })
  @ApiResponse({ status: 401, description: 'Invalid email or password.' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Sign up as an applicant and get JWT token' })
  @ApiResponse({ status: 201, description: 'Successfully signed up, returns JWT token.' })
  @ApiResponse({ status: 401, description: 'Email already in use.' })
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto.name, dto.email, dto.phone, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns the current users profile data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@Request() req: any) {
    return req.user;
  }
}
