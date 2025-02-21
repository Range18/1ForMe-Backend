export const messageTemplates = {
  singleTrainingBooking: {
    viaCashBox: (
      trainerName: string,
      studioAddress: string,
      trainingCost: number,
      date: string,
    ) => {
      return (
        `Вы забронировали тренировку в студии пилатеса 1forme к тренеру ${trainerName} по адресу ${studioAddress}, ${date}.` +
        '\n' +
        `Стоимость ${trainingCost} руб. Оплата на месте после тренировки.` +
        '\n' +
        `Отменить или перенести тренировку возможно не менее чем за 12 часов.` +
        '\n' +
        `Ждем вас!`
      );
    },
    viaOnlineService: (
      trainerName: string,
      studioAddress: string,
      trainingCost: number,
      date: string,
      paymentURL: string,
    ) => {
      return (
        `Вы забронировали тренировку в студии пилатеса 1forme к тренеру ${trainerName} по адресу ${studioAddress}, ${date}.` +
        '\n' +
        `Стоимость ${trainingCost} руб. Для оплаты и подтверждение записи перейдите по ссылке: ${paymentURL}` +
        '\n' +
        `Отменить или перенести тренировку возможно не менее чем за 12 часов.` +
        '\n' +
        `Если возникли вопросы, напишите нам!`
      );
    },
  },
  splitTrainingBooking: {
    firstClient: {
      viaOnlineService: (
        trainerName: string,
        studioAddress: string,
        trainingCost: number,
        date: string,
        paymentURL: string,
      ) => {
        return (
          `Вы забронировали сплит тренировку в студии пилатеса 1forme к тренеру ${trainerName} по адресу ${studioAddress}, ${date}.` +
          '\n' +
          `Стоимость ${trainingCost} руб. Для оплаты и подтверждение записи перейдите по ссылке: ${paymentURL}` +
          '\n' +
          `Отменить или перенести тренировку возможно не менее чем за 12 часов.` +
          '\n' +
          `Если возникли вопросы, напишите нам!`
        );
      },
      viaCashBox: (
        trainerName: string,
        studioAddress: string,
        date: string,
      ) => {
        return (
          `Вы забронировали сплит тренировку в студии пилатеса 1forme к тренеру ${trainerName} по адресу ${studioAddress}, ${date}.` +
          '\n' +
          `Отменить или перенести тренировку возможно не менее чем за 12 часов.` +
          '\n' +
          `Если возникли вопросы, напишите нам!`
        );
      },
    },
    secondClient: {
      viaOnlineService: (
        firstClientName: string,
        studioAddress: string,
        trainingCost: number,
        date: string,
        paymentURL: string,
      ) => {
        return (
          `${firstClientName} приглашает вас на сплит или тренировку вдвоём в студии пилатеса 1forme по адресу ${studioAddress}, ${date}.` +
          '\n' +
          `Стоимость ${trainingCost} руб. Для оплаты и подтверждение записи перейдите по ссылке: ${paymentURL}` +
          '\n' +
          `Отменить или перенести тренировку возможно не менее чем за 12 часов.` +
          '\n' +
          `Если возникли вопросы, напишите нам!`
        );
      },
      viaCashBox: (
        firstClientName: string,
        studioAddress: string,
        date: string,
      ) => {
        return (
          `${firstClientName} приглашает вас на сплит или тренировку вдвоём в студии пилатеса 1forme по адресу ${studioAddress}, ${date}.` +
          '\n' +
          `Отменить или перенести тренировку возможно не менее чем за 12 часов.` +
          '\n' +
          `Если возникли вопросы, напишите нам!`
        );
      },
    },
  },
  notifications: {
    paidTrainingTomorrow: (trainerName: string, date: string) => {
      return (
        `Напоминаем: завтра в ${date} у вас тренировка у тренера ${trainerName}.` +
        '\n' +
        `Вы можете отменить или перенести ее. При отмене за 12 часов тренировка сохранится в абонементе, а предоплата перенесется.` +
        '\n' +
        `В иных случаях тренировка или предоплата сгорает.` +
        '\n' +
        ` Чтобы отменить или перенести, напишите нам!`
      );
    },
    paidTrainingInTwoHours: (date: string) => {
      return (
        `Через 2 часа начинаем тренировку!` +
        '\n' +
        `Ждем вас в ${date}. Не забудьте взять с собой форму.` +
        '\n' +
        `До скорой встречи!`
      );
    },
    notifyUnpaid: (
      trainerName: string,
      studioAddress: string,
      time: string,
      trainingType: string,
      paymentUrl: string,
    ) => {
      return (
        `Напоминаем, что ждём вас на ${trainingType} тренировку по адресу ${studioAddress}, в ${time} у тренера ${trainerName}, ваша тренировка не оплачена.` +
        '\n' +
        `Для подтверждения записи оплатите пожалуйста тренировку по ссылке: ${paymentUrl}` +
        '\n' +
        `Без оплаты мы не сможем потведить вашу тренировку и вынуждены будем ее отменить.` +
        '\n' +
        `Если возникли вопросы, напишите нам!`
      );
    },
    canceledUnpaid: (dateAndTime: string) => {
      return (
        `К сожалению, ваша тренировка на ${dateAndTime} отменена из-за отсутствия оплаты.` +
        '\n' +
        ` Если хотите записаться снова, напишите нам или можете записаться самостоятельно на сайте 1forme.ru`
      );
    },
    canceled: (dateAndTime: string) => {
      return (
        `Ваша тренировка на ${dateAndTime} отменена.` +
        '\n' +
        `Если возникли вопросы или вы хотите записаться снова, напишите нам!`
      );
    },
    reschedulingTraining: (newDateAndTime: string) => {
      return (
        `Ваша тренировка перенесена на ${newDateAndTime}` +
        '\n' +
        `Ждем вас! Если возникли вопросы или вы хотите изменить время, напишите нам!`
      );
    },
    afterTrainingWithNextTraining: (date: string) => {
      return (
        `Спасибо, что были с нами сегодня! ` +
        '\n' +
        `Не забывайте пить больше воды и берегите себя — вы сегодня потрудились!` +
        '\n' +
        `Ждем вас снова на следующей тренировке: ${date}.` +
        '\n' +
        `Если что-то беспокоит или есть вопросы, просто напишите — мы всегда рядом!` +
        '\n' +
        `С заботой,` +
        '\n' +
        `Ваша студия пилатеса `
      );
    },
    afterTraining: () => {
      return (
        `Спасибо, что были с нами сегодня!` +
        '\n' +
        `Не забывайте пить больше воды и берегите себя — вы сегодня потрудились!` +
        '\n' +
        `Ждем вас снова на следующей тренировке.` +
        '\n' +
        `Если что-то беспокоит или есть вопросы, просто напишите — мы всегда рядом!` +
        '\n' +
        `С заботой,` +
        '\n' +
        `Ваша студия пилатеса`
      );
    },
    returnClient: (
      date: string,
      time: string,
      trainerName: string,
      url: string,
    ) => {
      return (
        `Мы скучаем по вам! Как насчет тренировки в ${date} в ${time} у тренера ${trainerName}?` +
        '\n' +
        `Забронируйте место: ${url}` +
        '\n' +
        `Если возникли вопросы или пожеления, напишите нам!`
      );
    },
    subscriptionCancellation: (trainerName: string) => {
      return (
        `Хотим напомнить, срок действия вашего абонемента у тренера ${trainerName} заказчивается через три дня.` +
        '\n' +
        `По истечению срока абонемента, тренировки сгорают.` +
        '\n' +
        `Если возникли вопросы, напишите нам!`
      );
    },
  },
  subscriptionBooking: {
    viaCashBox: (trainerName: string) => {
      return (
        `Благодарим вас за покупку абонемента на 5 тренировок у тренера ${trainerName}.` +
        '\n' +
        `Срок действия абонемента 25 дней с даты покупки.` +
        '\n' +
        `По истечению срока абонемента, тренировки сгорают.` +
        '\n' +
        `Если возникли вопросы, напишите нам!`
      );
    },
    viaOnlineService: (trainerName: string, paymentURL: string) => {
      return (
        `Благодарим вас за бронирование абонемента на 5 тренировок у тренера ${trainerName},` +
        '\n' +
        `оплатить его можно по ссылке: ${paymentURL}.` +
        '\n' +
        `Срок действия абонемента 25 дней с даты покупки.` +
        '\n' +
        `По истечению срока абонемента, тренировки сгорают.` +
        '\n' +
        `Если возникли вопросы, напишите нам!`
      );
    },
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
