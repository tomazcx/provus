import { ConflictException, Injectable } from '@nestjs/common';
import { ProctorRepository } from 'src/data/protocols/database';
import { Proctor } from 'src/domain/entities';
import { AuthService } from 'src/domain/services';
import { SignUpDto } from 'src/domain/services/auth/dto';
import * as bcrypt from 'bcrypt';
import { Env } from 'src/shared/env';

@Injectable()
export class AuthServiceImpl implements AuthService {
  constructor(private readonly proctorRepository: ProctorRepository) {}

  async signUp(dto: SignUpDto): Promise<Proctor> {
    const emailExists = await this.proctorRepository.findByEmail(dto.email);

    if (emailExists) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt(Env.HASH_SALT);
    const password = await bcrypt.hash(dto.password, salt);

    return this.proctorRepository.create({
      name: dto.name,
      email: dto.email,
      password,
    });
  }
}
