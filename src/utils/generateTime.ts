export const generateDate = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);

  const now = new Date();
  const dateWithTime = new Date(now);
  dateWithTime.setHours(hours, minutes, 0, 0);
  return dateWithTime
}