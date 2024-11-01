import { UserEntity } from '#src/core/users/entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { RolesEntity } from '#src/core/roles/entity/roles.entity';
import { backendServer } from '#src/common/configs/config';
import { Training } from '#src/core/trainings/entities/training.entity';
import { GetTrainingRdo } from '#src/core/trainings/rdo/get-training.rdo';
import { GetTrainerRdo } from '#src/core/users/rdo/get-trainer.rdo';
import { ChatTypes } from '#src/core/chat-types/entities/chat-type.entity';

export class GetUserRdo {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly surname: string;

  @ApiProperty({ type: () => RolesEntity })
  readonly role: RolesEntity;

  @ApiProperty({ nullable: true })
  readonly avatar?: string;

  @ApiProperty({ nullable: true, type: () => GetTrainerRdo })
  readonly trainerProfile?: GetTrainerRdo;

  @ApiProperty({ nullable: true })
  readonly birthday?: Date;

  //only if client
  @ApiProperty({ nullable: true })
  readonly closestTraining?: GetTrainingRdo;

  // @ApiProperty({ nullable: true })
  // readonly comment?: string;

  userNameInMessenger?: string;

  telegramUsername?: string;

  chatType: ChatTypes;

  @ApiProperty()
  readonly updatedAt: Date;

  @ApiProperty()
  readonly createdAt: Date;

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
    // this.comment =
    //   user.relatedComments && user.relatedComments.length !== 0
    //     ? user?.relatedComments[0].text
    //     : undefined;
    this.birthday = user.birthday;
    this.chatType = user.chatType ?? undefined;
    this.userNameInMessenger = user.userNameInMessenger;

    this.updatedAt = user.updatedAt;
    this.createdAt = user.createdAt;
  }
}
