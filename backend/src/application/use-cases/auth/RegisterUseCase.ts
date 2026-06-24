import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { TokenService } from '../../services/TokenService';
import { ConflictError, ValidationError } from '../../../shared/errors/AppError';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export class RegisterUseCase {
  constructor(
    private userRepo: IUserRepository,
    private tokenService: TokenService
  ) {}

  async execute(input: RegisterInput) {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) throw new ConflictError('Email already in use');

    if (input.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);
    const user = await this.userRepo.create({
      ...input,
      password: hashedPassword,
    });

    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = this.tokenService.generateRefreshToken();
    await this.tokenService.saveRefreshToken(user.id, refreshToken);

    const { password: _, ...userPublic } = user;
    return { user: userPublic, accessToken, refreshToken };
  }
}
