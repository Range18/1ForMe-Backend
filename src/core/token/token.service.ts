import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async signAsync(
    payload: object,
    options?: Partial<JwtSignOptions>,
  ): Promise<string> {
    return await this.jwtService.signAsync(payload, options);
  }

  async verifyAsync<T extends object>(
    token: string,
    options?: Partial<JwtVerifyOptions>,
  ): Promise<T> {
    return await this.jwtService.verifyAsync<T>(token, options);
  }
}
