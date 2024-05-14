import { Controller, UseGuards, Get, Req, Put, Body } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { UserResponseDto } from './dto/user-response.dto';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { User } from './user.decorator';
import { User as UserEntity } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getProfile(
    @Req() req: Request,
    @User() user: UserEntity,
  ): Promise<UserResponseDto> {
    return await this.userService.getUser(user.username);
  }

  @UseGuards(AuthGuard)
  @Put()
  async updateProfile(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: UserEntity,
  ): Promise<UpdateUserDto> {
    console.log(user);
    return await this.userService.updateUser(user.username, updateUserDto);
  }
}
