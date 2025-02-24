export namespace AllExceptions {
  export enum AuthExceptions {
    WrongPassword = 'Неверный пароль',
    ExpiredToken = 'Срок действия токена истёк',
    InvalidAccessToken = 'Невалидный токен доступа',
    InvalidCrmToken = 'Невалидный CRM токен',
    WrongVerificationCode = 'Wrong verification code',
  }

  export enum FileExceptions {
    FileNotFound = 'Файл не найден',
    ErrorWhileDeleting = 'Файла нет или он сломан',
  }

  export enum TariffExceptions {
    NotFound = 'Тариф не найден',
  }

  export enum SessionExceptions {
    SessionNotFound = 'Сессия не найдена',
    SessionExpired = 'Сессия истекла',
  }

  export enum UserExceptions {
    UserNotFound = 'Пользователь не найден',
    UserAlreadyExists = 'Пользователь с таким номером телефона уже существет',
    NoClientData = 'Недостаточно данных о клиенте',
  }

  export enum TrainerExceptions {
    NotWorking = 'Тренер не работает',
    WithoutCategory = 'Невозможно найти тариф по роли квалификации тренера',
    NotFound = 'Тренер не найден',
    NotAttached = 'Тренер не привязан к клиенту',
    AttachedAlready = 'Тренер уже привязан к клиенту',
    AlreadyWorking = 'Тренер уже работает в это время',
  }

  export enum RolesExceptions {
    NotFound = 'Роль не найдена',
  }

  export enum StudioExceptions {
    NotFound = 'Студия не найдена',
  }

  export enum ClubSlotsExceptions {
    NotFound = 'Клуб не найден',
  }

  export enum TrainerSlotsExceptions {
    AlreadyExists = 'Слот уже забронирован вами',
  }

  export enum TransactionExceptions {
    NotFound = 'Транзакция не найдена',
    AlreadyCanceled = 'Транзакция уже отменена',
  }

  export enum EntityExceptions {
    NotFound = 'Сущность не найдена',
  }

  export enum GiftCardExceptions {
    NotFound = 'Сертификат не найден',
  }

  export enum NotificationExceptions {
    NotFound = 'Уведомленеие не найдено',
  }

  export enum TrainingExceptions {
    NotFound = 'Тренировка не найдена',
    ClientsAmountError = 'Тариф подразумевает другое кол-во клиентов',
    TrainingAlreadyExists = 'На это время и в этот зал уже есть запись',
    RepeatedAndPaidViaCashBox = 'Тренировки, которые повторяются не могут быть оплачены через кассу!',
  }

  export enum SubscriptionExceptions {
    NotFound = 'Entity is not found',
    TrainingAmountErr = 'tariff.trainingAmount != trainings.length',
    CancelingForbidden = 'Нельзя вернуть деньги за абонемент, тренировки по которому частично или полностью использованы.',
  }

  export enum StorageExceptions {
    NotFound = 'Файл не найден',
  }

  export enum PermissionExceptions {
    NotTheSameUser = 'Action is forbidden because user is not owner',
    NoRequiredRole = 'You are not allowed to do that action, because of your role',
  }

  export enum Queries {
    InvalidLimitOffset = 'limit * offset - offset can`t be < 0',
  }

  export enum BootstrapExceptions {
    WazzupMessagingSettingsNotFound = 'Wazzup messaging settings are not found',
  }

  export enum PaymentExceptions {
    FailedToCreatePayment = 'Failed to create payment',
    FailedToCancelOrRefundPayment = 'Failed to cancel or refund payment',
    PaymentNotFound = 'Payment not found',
    PaymentAlreadyCanceledOrRefunded = 'Payment already canceled or refunded',
    WrongToken = 'Wrong data Token',
    BadIp = 'Bad request IP',
  }
}
