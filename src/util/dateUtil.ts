const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");
  
  return `${year}-${month}-${day}-${hours}-${minutes}-${milliseconds}`;
};

export default formatDate;
