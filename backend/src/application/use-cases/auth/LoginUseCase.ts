import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { TokenService } from '../../services/TokenService';
import { UnauthorizedError } from '../../../shared/errors/AppError';

interface LoginInput {
  email: string;
  password: string;
}

export class LoginUseCase {
  constructor(
    private userRepo: IUserRepository,
    private tokenService: TokenService
  ) {}

  async execute(input: LoginInput) {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user || !user.isActive) throw new UnauthorizedError('Invalid credentials');

    const isValid = await bcrypt.compare(input.password, user.password);
    if (!isValid) throw new UnauthorizedError('Invalid credentials');

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
