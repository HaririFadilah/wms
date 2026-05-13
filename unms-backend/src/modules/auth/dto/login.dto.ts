import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  /** Accepts either email OR username — we look up both. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(190)
  usernameOrEmail!: string;

  @IsString()
  @MinLength(6, { message: 'password must be at least 6 characters' })
  @MaxLength(200)
  password!: string;
}
