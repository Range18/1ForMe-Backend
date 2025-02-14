export const messageTemplates = {
  singleTrainingBooking: {
    viaCashBox: (
      trainerName: string,
      studioAddress: string,
      trainingCost: number,
      date: string,
    ) => {
      return ` 
          Вы забронировали тренировку в студии пилатеса 1forme к тренеру ${trainerName} по адресу ${studioAddress}, ${date}. 
          Стоимость ${trainingCost} руб. Оплата на месте после тренировки. 
          Отменить или перенести тренировку возможно не менее чем за 12 часов. 
          Ждем вас!
          `;
    },
    viaOnlineService: (
      trainerName: string,
      studioAddress: string,
      trainingCost: number,
      date: string,
      paymentURL: string,
    ) => {
      return ` 
          Вы забронировали тренировку в студии пилатеса 1forme к тренеру ${trainerName} по адресу ${studioAddress}, 
          ${date}. Стоимость ${trainingCost} руб. Для оплаты и подтверждение записи перейдите по ссылке: ${paymentURL} 
          Отменить или перенести тренировку возможно не менее чем за 12 часов. 
          Если возникли вопросы, напишите нам!`;
    },
  },
  splitTrainingBooking: {
    firstClient: (
      trainerName: string,
      studioAddress: string,
      trainingCost: number,
      date: string,
      paymentURL: string,
    ) => {
      return ` 
Вы забронировали сплит тренировку в студии пилатеса 1forme к тренеру ${trainerName} по адресу ${studioAddress}, ${date}. 
Стоимость ${trainingCost} руб. Для оплаты и подтверждение записи перейдите по ссылке: ${paymentURL}
Отменить или перенести тренировку возможно не менее чем за 12 часов. 
Если возникли вопросы, напишите нам!
          `;
    },
    secondClient: (
      firstClientName: string,
      studioAddress: string,
      trainingCost: number,
      date: string,
      paymentURL: string,
    ) => {
      return ` 
${firstClientName} приглашает вас на сплит или тренировку вдвоём в студии пилатеса 1forme по адресу ${studioAddress}, ${date}.
 Стоимость ${trainingCost} руб. Для оплаты и подтверждение записи перейдите по ссылке: ${paymentURL}
 Отменить или перенести тренировку возможно не менее чем за 12 часов. 
Если возникли вопросы, напишите нам!`;
    },
  },
  notifications: {
    paidTrainingTomorrow: (trainerName: string, date: string) => {
      return `Напоминаем: завтра в ${date} у вас тренировка у тренера ${trainerName}. 
      Вы можете отменить или перенести ее. При отмене за 12 часов тренировка сохранится в абонементе, а предоплата перенесется. 
      В иных случаях тренировка или предоплата сгорает. 
      Чтобы отменить или перенести, напишите нам!`;
    },
    paidTrainingInTwoHours: (date: string) => {
      return `Через 2 часа начинаем тренировку! Ждем вас в ${date}. Не забудьте взять с собой форму. До скорой встречи!`;
    },
    notifyUnpaid: (
      trainerName: string,
      studioAddress: string,
      time: string,
      trainingType: string,
      paymentUrl: string,
    ) => {
      return `Напоминаем, что ждём вас на ${trainingType} тренировку по адресу ${studioAddress}, в ${time} у тренера ${trainerName}, ваша тренировка не оплачена. 
      Для подтверждения записи оплатите пожалуйста тренировку по ссылке: ${paymentUrl}
      Без оплаты мы не сможем потведить вашу тренировку и вынуждены будем ее отменить. 
      Если возникли вопросы, напишите нам!`;
    },
    canceledUnpaid: (dateAndTime: string) => {
      return `К сожалению, ваша тренировка на ${dateAndTime} отменена из-за отсутствия оплаты. 
      Если хотите записаться снова, напишите нам или можете записаться самостоятельно на сайте 1forme.ru`;
    },
    canceled: (dateAndTime: string) => {
      return `Ваша тренировка на ${dateAndTime} отменена. 
      Если возникли вопросы или вы хотите записаться снова, напишите нам!`;
    },
    reschedulingTraining: (newDateAndTime: string) => {
      return `Ваша тренировка перенесена на ${newDateAndTime}  
      Ждем вас! Если возникли вопросы или вы хотите изменить время, напишите нам!`;
    },
    afterTraining: (date: string) => {
      return `Спасибо, что были с нами сегодня! Не забывайте пить больше воды и берегите себя — вы сегодня потрудились! 
  Ждем вас снова на следующей тренировке: ${date}. 
  Если что-то беспокоит или есть вопросы, просто напишите — мы всегда рядом!
  С заботой, 
  Ваша студия пилатеса `;
    },
    returnClient: (
      date: string,
      time: string,
      trainerName: string,
      url: string,
    ) => {
      return `Мы скучаем по вам! Как насчет тренировки в ${date} в ${time} у тренера ${trainerName}? 
      Забронируйте место: ${url}. 
      Если возникли вопросы или пожеления, напишите нам!`;
    },
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
  subscriptionBooking: (trainerName: string) => {
    return `Благодарим вас за покупку абонемента на 5 тренировок у тренера ${trainerName}.
Срок действия абонемента 25 дней с даты покупки.
По истечению срока абонемента, тренировки сгорают.
Если возникли вопросы, напишите нам!`;
  },
  subscriptionCancellation: (trainerName: string) => {
    return `Хотим напомнить, срок действия вашего абонемента у тренера ${trainerName} заказчивается через три дня. 
    По истечению срока абонемента, тренировки сгорают. 
    Если возникли вопросы, напишите нам!`;
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
} as const;
