export const notificationMessageTemplates = {
  'training-booking': (
    trainerName: string,
    clientName: string,
    date: string,
    time: string,
  ) => {
    return `${trainerName}, бронь ${date} в ${time}, клиент ${clientName}`;
  },
  'training-cancellation': (
    trainerName: string,
    clientName: string,
    date: string,
    time: string,
  ) => {
    return `${trainerName}, отмена тренировки на ${date} в ${time}, клиент ${clientName}`;
  },
  'subscription-purchased': (
    trainerName: string,
    clientName: string,
    tariffName: string,
  ) => {
    return `${trainerName}, приобретён абонемент по тарифу ${tariffName}, клиент ${clientName}`;
  },
  'subscription-cancellation': (
    trainerName: string,
    clientName: string,
    tariffName: string,
  ) => {
    return `${trainerName}, отмена абонемента по тарифу ${tariffName} , клиент ${clientName}`;
  },
};
