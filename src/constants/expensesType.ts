// constants/expensesType.ts
export const ExpensesType = {
  UTILITY: "UTILITY",
  MAINTANCE: "MAINTANCE",
  LONDRY: "LONDRY",
  ELECTRICITY: "ELECTRICITY",
  SALARY: "SALARY",
  OTHER: "OTHER",
} as const;

export type ExpenseType = (typeof ExpensesType)[keyof typeof ExpensesType];
