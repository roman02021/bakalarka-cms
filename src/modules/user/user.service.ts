import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterDto } from '../auth/dto/register.dto';
import { User } from './entities/user.entity';
import { EntityManager } from '@mikro-orm/postgresql';
import { validate } from 'class-validator';
import { buildError } from '../shared/utils';
@Injectable()
export class UserService {
  constructor(private readonly em: EntityManager) {}

  async findOne(username: string): Promise<User | undefined> {
    return await this.em.findOne(User, { username });
  }
  async register(registerDto: RegisterDto): Promise<string | undefined> {
    try {
      const newUser = this.em.create(User, registerDto);
      const errors = await validate(newUser);
      if (errors.length > 0) {
        throw new HttpException(
          {
            message: 'Validation failed',
            errors: buildError(errors),
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.em.persistAndFlush(newUser);
      return 'Account created';
    } catch (error) {
      throw new HttpException(error, HttpStatus.CONFLICT);
    }
  }
}
