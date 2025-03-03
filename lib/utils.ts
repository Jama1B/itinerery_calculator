import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculatePercentage(expression: string): number {
  // Remove all whitespace
  expression = expression.replace(/\s/g, "")

  // Split by '+' to separate the base number and percentage
  const parts = expression.split("+")

  if (parts.length !== 2) {
    throw new Error('Invalid expression format. Expected format: "number+percentage%"')
  }

  const baseNumber = Number.parseFloat(parts[0])
  const percentageStr = parts[1].replace("%", "")
  const percentage = Number.parseFloat(percentageStr)

  if (isNaN(baseNumber) || isNaN(percentage)) {
    throw new Error("Invalid numbers in expression")
  }

  // Calculate the result: base + (base * percentage/100)
  const result = baseNumber + baseNumber * (percentage / 100)

  // Round to 2 decimal places
  return Math.round(result * 100) / 100
}

