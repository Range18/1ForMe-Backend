export const messageTemplates = {
  'single-training-booking': (
    trainingCost: number,
    date: string,
    paymentURL: string,
    studioName: string,
    studioAddress: string,
  ) => {
    return (
      `Вы забронировали тренировку в студии пилатеса ${studioName} по адресу ${studioAddress}, в ${date}, стоимость тренировки ${trainingCost} руб.` +
      '\n' +
      `Для оплаты и подтверждение перейдите по ссылке: ${paymentURL}` +
      '\n' +
      'Отменить или перенести тренировку возможно не менее чем за 12 часов.\n'
    );
  },
  'single-training-booking-for-trainer': (
    trainingCost: number,
    date: string,
    studioName: string,
    studioAddress: string,
  ) => {
    return (
      `У вас забронировали тренировку в студии пилатеса ${studioName} по адресу ${studioAddress}, в ${date}, стоимость тренировки ${trainingCost} руб.` +
      '\n'
    );
  },
  'subscription-booking': (
    trainingsCount: number,
    subscriptionCost: number,
    paymentURL: string,
    date: string,
    studioName: string,
    studioAddress: string,
  ) => {
    return (
      `Вы забронировали абонемент на ${trainingsCount} тренировок в студию пилатеса ${studioName} по адресу ${studioAddress}, стоимость абонемента ${subscriptionCost} руб. Ваша 1я тренировка из ${trainingsCount} в ${date}.` +
      '\n' +
      `Для оплаты и подтверждение перейдите по ссылке: ${paymentURL}` +
      '\n' +
      'Отменить или перенести тренировку возможно не менее чем за 12 часов.\n'
    );
  },

  'subscription-booking-for-trainer': (
    trainingsCount: number,
    subscriptionCost: number,
    date: string,
    studioName: string,
    studioAddress: string,
  ) => {
    return (
      `У вас забронировали абонемент на ${trainingsCount} тренировок в студию пилатеса ${studioName} по адресу ${studioAddress}, стоимость абонемента ${subscriptionCost} руб. Ваша 1я тренировка из ${trainingsCount} в ${date}.` +
      '\n'
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
  'notify-about-tomorrow-paid-training': (
    studioAddress: string,
    time: string,
  ) => {
    return (
      `Добрый день! Ждём вас завтра по тренировку по адресу ${studioAddress} в ${time}, ваша тренировка оплачена. ` +
      '\n' +
      'Отменить или перенести тренировку возможно не менее чем за 12 часов.'
    );
  },
  'notify-about-tomorrow-unpaid-training': (
    studioAddress: string,
    time: string,
    paymentURL: string,
  ) => {
    return (
      `Добрый день! Ждём вас завтра по тренировку по адресу ${studioAddress} в ${time}, ваша тренировка не оплачена.` +
      '\n' +
      `Для подтверждения записи оплатите пожалуйста тренировку по ссылке: ${paymentURL}`
    );
  },

  'training-is-canceled': (date: string) => {
    return 'Здравствуйте!' + '\n' + `Ваша тренировка на ${date} отменена.`;
  },

  'training-is-refunded': (date: string, cost: number) => {
    return (
      'Здравствуйте!' +
      '\n' +
      `Ваша тренировка на ${date} отменена. В ближайшее время оплата в размере ${cost} руб. поступят на счёт, с которого вы оплачивали тренировку`
    );
  },
  'training-date-is-changed': (oldDate: string, newDate: string) => {
    return (
      'Здравствуйте!' +
      '\n' +
      `Ваша тренировка на ${oldDate} перенесена на ${newDate}.`
    );
  },
} as const;
