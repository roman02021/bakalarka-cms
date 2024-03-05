import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { User } from './entities/User.entity';
import { MikroORM, EntityManager } from '@mikro-orm/core';

@Injectable()
export class UserService {
  constructor(
    private readonly orm: MikroORM,
    private readonly em: EntityManager,
  ) {}

  async findOne(username: string): Promise<User | undefined> {
    return await this.em.findOne(User, { username });
  }
  async register(registerDto: RegisterDto): Promise<User | undefined> {
    const newUser = this.em.create(User, registerDto);
    try {
      const registeredUser = await this.em.upsert(newUser);
      return registeredUser;
    } catch (error) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }
  }
}
