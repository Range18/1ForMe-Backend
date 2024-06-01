import { Training } from '#src/core/trainings/entities/training.entity';

export const messageTemplates = {
  'single-training-booking': (
    trainingCost: number,
    date: string,
    paymentURL: string,
  ) => {
    return (
      `Вы забронировали персональную тренировку в студии пилатеса 1forme по адресу Революции 21в, в ${date}, стоимость тренировки ${trainingCost} руб.` +
      '\n' +
      `Для оплаты и подтверждение перейдите по ссылке: ${paymentURL}` +
      '\n' +
      'Отменить или перенести тренировку возможно не менее чем за 12 часов.\n'
    );
  },
  'subscription-booking': (
    trainingsCount: number,
    subscriptionCost: number,
    paymentURL: string,
    date: string,
  ) => {
    return (
      `Вы забронировали абонемент на ${trainingsCount} тренировок в студию пилатеса 1forme по адресу Революции 21в, стоимость абонемента ${subscriptionCost} руб. Ваша 1я тренировка из ${trainingsCount} в ${date}.` +
      '\n' +
      `Для оплаты и подтверждение перейдите по ссылке: ${paymentURL}` +
      '\n' +
      'Отменить или перенести тренировку возможно не менее чем за 12 часов.\n'
    );
  },
  'subscription-with-first-training-booking': (
    trainingsCount: number,
    subscriptionCost: number,
    subscriptionFee: number,
    paymentURL: string,
  ) => {
    return (
      `Вы забронировали абонемент на ${trainingsCount} тренировок в студию пилатеса 1forme по адресу Революции 21в. Ваша 1я тренировка включена в абонемент по стоимости ${subscriptionCost} руб., стоимость доплаты за абонемент ${subscriptionFee} руб.` +
      '\n' +
      `Для оплаты и подтверждение перейдите по ссылке: ${paymentURL}` +
      '\n' +
      'Отменить или перенести тренировку возможно не менее чем за 12 часов.\n'
    );
  },
  //TODO
  'training-date-is-changed': (
    training: Training,
    oldDate: number,
    oldTime: number,
  ) => {
    return 'ТЕКСТ ТЕКСТ ТЕКСТ';
  },
} as const;
