import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatInTimeZone } from "date-fns-tz";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to IST in "dd-MM-yyyy hh:mm a" format
export const formatDate = (date: Date) => {
  const timeZone = "Asia/Kolkata"; // IST
  return formatInTimeZone(date, timeZone, "dd-MM-yyyy hh:mm a");
};

export const toTitleCase = (val: string) =>
  String(val).charAt(0).toUpperCase() + String(val).slice(1);
