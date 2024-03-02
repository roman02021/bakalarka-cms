import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { User } from './entities/User.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async findOne(username: string): Promise<User | undefined> {
    return await this.usersRepository.findOneBy({ username });
  }
  async register(registerDto: RegisterDto): Promise<User | undefined> {
    console.log(registerDto);

    const newUser = this.usersRepository.create(registerDto);
    try {
      const registeredUser = await this.usersRepository.save(newUser);
      return registeredUser;
    } catch (error) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }
  }
}
