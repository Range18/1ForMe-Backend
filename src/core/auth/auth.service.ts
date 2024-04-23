import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoggedUserRdo } from '../users/rdo/logged-user.rdo';
import { UserService } from '../users/user.service';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { SessionService } from '../session/session.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { RolesService } from '#src/core/roles/roles.service';
import { uid } from 'uid';
import { CreateClientDto } from '#src/core/users/dto/create-client.dto';
import AuthExceptions = AllExceptions.AuthExceptions;
import UserExceptions = AllExceptions.UserExceptions;

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly rolesService: RolesService,
    private readonly sessionService: SessionService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<LoggedUserRdo> {
    const user = await this.userService.findOne(
      {
        where: { phone: createUserDto.phone },
      },
      false,
    );

    if (user) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'UserExceptions',
        UserExceptions.UserAlreadyExists,
      );
    }

    const userEntity = await this.userService.save({
      name: createUserDto.name,
      surname: createUserDto.surname,
      //TODO Enable
      // password: await bcrypt.hash(createUserDto.password, passwordSaltRounds),
      password: createUserDto.password,
      phone: createUserDto.phone,
      role: await this.rolesService.findOne({
        where: { name: createUserDto.role },
      }),
      trainers: [{ id: createUserDto.trainer }],
    });

    const session = await this.sessionService.createSession({
      userId: userEntity.id,
    });

    return new LoggedUserRdo(
      session.accessToken,
      session.sessionExpireAt,
      userEntity.phone,
    );
  }

  async registerAsTrainer(
    createUserDto: CreateUserDto,
  ): Promise<LoggedUserRdo> {
    const user = await this.userService.findOne(
      {
        where: { phone: createUserDto.phone },
      },
      false,
    );

    if (user) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'UserExceptions',
        UserExceptions.UserAlreadyExists,
      );
    }

    const userEntity = await this.userService.save({
      name: createUserDto.name,
      surname: createUserDto.surname,
      //TODO Enable
      // password: await bcrypt.hash(createUserDto.password, passwordSaltRounds),
      password: createUserDto.password,
      phone: createUserDto.phone,
      role: await this.rolesService.findOne({
        where: { name: createUserDto.role },
      }),
      link: createUserDto.role === 'trainer' ? uid(8) : null,
      studio: createUserDto.studio ? { id: createUserDto.studio } : null,
      experience: createUserDto.experience,
      category: createUserDto.category ? { id: createUserDto.category } : null,
      description: createUserDto.description,
      whatsApp: createUserDto.whatsApp,
    });

    const session = await this.sessionService.createSession({
      userId: userEntity.id,
    });

    return new LoggedUserRdo(
      session.accessToken,
      session.sessionExpireAt,
      userEntity.phone,
    );
  }

  async login(loginUserDto: LoginUserDto): Promise<LoggedUserRdo> {
    const user = await this.userService.findOne({
      where: { phone: loginUserDto.login },
    });

    if (!user) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'UserExceptions',
        UserExceptions.UserNotFound,
      );
    }

    //TODO Enable
    // const comparedPasswords = await bcrypt.compare(
    //   loginUserDto.password,
    //   user.password,
    // );

    const comparedPasswords = loginUserDto.password === user.password;

    if (!comparedPasswords) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'AuthExceptions',
        AuthExceptions.WrongPassword,
      );
    }
    const session = await this.sessionService.createSession({
      userId: user.id,
    });

    return new LoggedUserRdo(
      session.accessToken,
      session.sessionExpireAt,
      user.phone,
    );
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionService.removeOne({
      where: { sessionId: sessionId },
    });
  }

  async signUpByTrainer(createClientDto: CreateClientDto, trainerId: number) {
    const trainer = await this.userService.findOne({
      where: { id: trainerId },
    });

    if (!trainer) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'UserExceptions',
        UserExceptions.UserNotFound,
      );
    }

    const clientExists = await this.userService.findOne(
      {
        where: { phone: createClientDto.phone },
      },
      false,
    );

    if (clientExists) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'UserExceptions',
        UserExceptions.UserAlreadyExists,
      );
    }

    return await this.userService.save({
      ...createClientDto,
      role: await this.rolesService.findOne({
        where: { name: createClientDto.role },
      }),
      trainers: [{ id: trainerId }],
    });
  }
}
