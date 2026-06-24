import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { TokenService } from '../../services/TokenService';
import { NotFoundError } from '../../../shared/errors/AppError';

export class RefreshTokenUseCase {
  constructor(
    private userRepo: IUserRepository,
    private tokenService: TokenService
  ) {}

  async execute(refreshToken: string) {
    const userId = await this.tokenService.validateRefreshToken(refreshToken);
    const user = await this.userRepo.findById(userId);
    if (!user || !user.isActive) throw new NotFoundError('User not found');

    await this.tokenService.revokeRefreshToken(refreshToken);

    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const newRefreshToken = this.tokenService.generateRefreshToken();
    await this.tokenService.saveRefreshToken(user.id, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
