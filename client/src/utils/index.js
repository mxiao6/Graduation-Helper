export const daysMap = {
  M: 1,
  T: 2,
  W: 3,
  R: 4,
  F: 5,
};

export const _parseTime = time => {
  let hour = parseInt(time.substr(0, 2), 10);
  let mins = parseInt(time.substr(3, 2), 10);

  if (time.slice(-2) === 'PM' && hour !== 12) hour += 12;

  return { hour, mins };
};
