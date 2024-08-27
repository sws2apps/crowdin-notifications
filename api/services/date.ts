export const checkDateDelay = (date: Date) => {
  const delayTime = process.env.API_DELAY_TIME ? +process.env.API_DELAY_TIME : 60;

  const validDate = new Date(date);
  validDate.setMinutes(delayTime + 1);

  const validDateISO = validDate.toISOString();
  const checkDateISO = new Date().toISOString();

  return validDateISO < checkDateISO;
};
