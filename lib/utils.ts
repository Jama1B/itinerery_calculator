import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const calculatePercentage = (expression: string): number => {
  try {
    // Extract the base number and percentage from the expression
    const [baseStr, percentageStr] = expression.split("+");
    const base = Number.parseFloat(baseStr);
    const percentage = Number.parseFloat(percentageStr.replace("%", ""));

    if (isNaN(base) || isNaN(percentage)) {
      return 0; // Or throw an error, depending on desired behavior
    }

    // Calculate the percentage amount
    const percentageAmount = (base * percentage) / 100;

    // Return the total amount (base + percentage)
    return base + percentageAmount;
  } catch (error) {
    return 0; // Or throw an error, depending on desired behavior
  }
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
