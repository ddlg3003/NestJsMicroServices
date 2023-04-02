// Reference: https://stackoverflow.com/questions/65730350/how-convert-date-excel-from-float-nodejs
export function convertDateExcel (excelDate: number): Date {
  // Get the number of milliseconds from Unix epoch.
  const unixTime = (excelDate - 25569) * 86400 * 1000;
  return new Date(unixTime);
}