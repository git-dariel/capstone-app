// Philippines timezone utility functions for frontend
export const getPhilippinesTime = (): Date => {
  // Philippines is UTC+8
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const philippinesTime = new Date(utc + 8 * 3600000); // UTC+8
  return philippinesTime;
};

export const toPhilippinesTime = (date: Date): Date => {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const philippinesTime = new Date(utc + 8 * 3600000); // UTC+8
  return philippinesTime;
};

// Get start of day in Philippines timezone
export const getPhilippinesStartOfDay = (date?: Date): Date => {
  const targetDate = date ? toPhilippinesTime(date) : getPhilippinesTime();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

// Get end of day in Philippines timezone
export const getPhilippinesEndOfDay = (date?: Date): Date => {
  const targetDate = date ? toPhilippinesTime(date) : getPhilippinesTime();
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
};

// Check if a date is in the past relative to Philippines timezone
export const isDateInPast = (date: Date): boolean => {
  const philippinesNow = getPhilippinesTime();
  const philippinesDate = toPhilippinesTime(date);
  return philippinesDate < philippinesNow;
};

// Check if a date is today or future relative to Philippines timezone
export const isDateTodayOrFuture = (date: Date): boolean => {
  const philippinesNow = getPhilippinesStartOfDay();
  const philippinesDate = getPhilippinesStartOfDay(date);
  return philippinesDate >= philippinesNow;
};

// Format date to Philippine format
export const formatPhilippinesDate = (date: Date): string => {
  const philippinesDate = toPhilippinesTime(date);
  return philippinesDate.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format date and time to Philippine format
export const formatPhilippinesDateTime = (date: Date): string => {
  const philippinesDate = toPhilippinesTime(date);
  return philippinesDate.toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Get current date in Philippines for input fields (YYYY-MM-DD format)
export const getPhilippinesDateForInput = (): string => {
  const philippinesDate = getPhilippinesTime();
  return philippinesDate.toISOString().split("T")[0];
};

// Convert date to Philippines timezone and format for input fields
export const formatDateForInput = (date: Date): string => {
  const philippinesDate = toPhilippinesTime(date);
  return philippinesDate.toISOString().split("T")[0];
};
