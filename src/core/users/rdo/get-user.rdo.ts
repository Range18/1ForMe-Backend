import { UserEntity } from '#src/core/users/entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { RolesEntity } from '#src/core/roles/entity/roles.entity';
import { backendServer } from '#src/common/configs/config';
import { Training } from '#src/core/trainings/entities/training.entity';
import { GetTrainingRdo } from '#src/core/trainings/rdo/get-training.rdo';
import { GetTrainerRdo } from '#src/core/users/rdo/get-trainer.rdo';
import { ChatTypes } from '#src/core/chat-types/entities/chat-type.entity';

export class GetUserRdo {
  id: number;

  name: string;

  surname: string;

  @ApiProperty({ type: () => RolesEntity })
  role: RolesEntity;

  avatar?: string;

  @ApiProperty({ nullable: true, type: () => GetTrainerRdo })
  trainerProfile?: GetTrainerRdo;

  birthday?: Date;

  //Only if client
  closestTraining?: GetTrainingRdo;

  userNameInMessenger?: string;

  telegramUsername?: string;

  chatType: ChatTypes;

  updatedAt: Date;

  createdAt: Date;

  constructor(user: UserEntity, training?: Training) {
    this.id = user.id;
    this.name = user.name;
    this.surname = user.surname;
    this.role = user.role ?? undefined;
    this.avatar = user.avatar
      ? `${backendServer.urlValue}/api/assets/${user.avatar.id}/file`
      : undefined;
    this.telegramUsername = user.telegramUsername;
    this.closestTraining = training ? new GetTrainingRdo(training) : undefined;
    this.trainerProfile =
      user?.role?.name == 'trainer' ? new GetTrainerRdo(user) : undefined;
    this.birthday = user.birthday;
    this.chatType = user.chatType ?? undefined;
    this.userNameInMessenger = user.userNameInMessenger;

    this.updatedAt = user.updatedAt;
    this.createdAt = user.createdAt;
  }
}
