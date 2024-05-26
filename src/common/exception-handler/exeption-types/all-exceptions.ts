export namespace AllExceptions {
  export enum AuthExceptions {
    AccountIsNotVerified = 'Account is not verified. Please verify your email.',
    WrongPassword = 'Wrong password',
    ExpiredToken = 'Access token expired',
    InvalidAccessToken = 'Invalid access token',
    WrongVerificationCode = 'Wrong verification code',
  }

  export enum FileExceptions {
    FileNotFound = 'File is not found',
    ErrorWhileDeleting = 'File does not exists or is broken',
  }

  export enum SessionExceptions {
    SessionNotFound = 'Session is not found',
    SessionExpired = 'Session expired',
  }

  export enum UserExceptions {
    UserNotFound = 'User is not found',
    UserAlreadyExists = 'User already exists',
  }

  export enum TrainerExceptions {
    NotWorking = 'Trainer is not working',
  }

  export enum RolesExceptions {
    NotFound = 'Role is not found',
  }

  export enum StudioExceptions {
    NotFound = 'Studio is not found',
  }

  export enum EntityExceptions {
    NotFound = 'Entity is not found',
  }

  export enum StorageExceptions {
    NotFound = 'File is not found',
  }

  export enum PermissionExceptions {
    NotTheSameUser = 'Action is forbidden because user is not owner',
    NoRequiredRole = 'You are not allowed to do that action, because of your role',
  }

  export enum Queries {
    InvalidLimitOffset = 'limit * offset - offset can`t be < 0',
  }

  export enum PaymentExceptions {
    FailedToCreateURL = 'Failed to create payment URL',
    FailedToCancelPayment = 'Failed to cancel payment',
    FailedToRefundPayment = 'Failed to refund payment',
    PaymentNotFound = 'Payment not found',
    PaymentAlreadyCanceled = 'Payment already canceled',
    PaymentAlreadyRefunded = 'Payment already refunded',
    PaymentAlreadyCanceledOrRefunded = 'Payment already canceled or refunded',
    WrongToken = 'Wrong data Token',
    BadIp = 'Bad request IP',
  }
}
