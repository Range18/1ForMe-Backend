export const trainerMessagesTemplates = {
  'training-booking': (
    clientName: string,
    trainingCost: number,
    date: string,
    studioName: string,
    studioAddress: string,
  ) => {
    return (
      `${clientName} забронировал(a) у вас тренировку в студии пилатеса ${studioName} по адресу ${studioAddress}, в ${date}, стоимость тренировки ${trainingCost} руб.` +
      '\n'
    );
  },
  'subscription-booking': (
    clientName: string,
    trainingsCount: number,
    subscriptionCost: number,
    studioName: string,
    studioAddress: string,
  ) => {
    return (
      `${clientName} приобрёл(a) у вас абонемент на ${trainingsCount} тренировок в студию пилатеса ${studioName} по адресу ${studioAddress}, стоимость абонемента ${subscriptionCost} руб.` +
      '\n'
    );
  },
} as const;
