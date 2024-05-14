import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: number;
  @Expose()
  name: string;
  @Expose()
  username: string;
  @Expose()
  email: string;
}
