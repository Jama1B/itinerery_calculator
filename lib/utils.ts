import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const calculatePercentage = (expression: string): number => {
  return typeof expression !== "string" || !expression.includes("+")
    ? NaN
    : (() => {
        const [base, percentage] = expression.split("+");
        const baseValue = parseFloat(base);
        const percentageValue = parseFloat(percentage.replace("%", ""));
        return isNaN(baseValue) || isNaN(percentageValue)
          ? NaN
          : baseValue + (baseValue * percentageValue) / 100;
      })();
};
