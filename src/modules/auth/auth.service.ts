import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string): Promise<{ token: string }> {
    const user = await this.usersService.findOne(username);
    if (!(await bcrypt.compare(password, user?.password))) {
      throw new UnauthorizedException();
    }
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
    };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }
  async register(registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }
}
