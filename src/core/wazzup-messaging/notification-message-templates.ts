export const notificationMessageTemplates = {
  'single-training-booking': (
    trainerName: string,
    clientName: string,
    date: string,
    time: string,
  ) => {
    return `${trainerName}, бронь ${date} в ${time}, клиент ${clientName}`;
  },
};
